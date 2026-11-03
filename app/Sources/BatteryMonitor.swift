import Foundation
import IOKit.ps
import AVFoundation
import UserNotifications
import AppKit
import UniformTypeIdentifiers

/// One snapshot of the internal battery, read straight from IOKit.
struct BatteryReading: Equatable {
    var percent: Int
    var onAC: Bool
    var isCharging: Bool

    static func read() -> BatteryReading? {
        guard let info = IOPSCopyPowerSourcesInfo()?.takeRetainedValue(),
              let list = IOPSCopyPowerSourcesList(info)?.takeRetainedValue() as? [CFTypeRef] else { return nil }
        for ps in list {
            guard let d = IOPSGetPowerSourceDescription(info, ps)?.takeUnretainedValue() as? [String: Any],
                  (d[kIOPSTypeKey] as? String) == kIOPSInternalBatteryType,
                  let cur = d[kIOPSCurrentCapacityKey] as? Int,
                  let mx = d[kIOPSMaxCapacityKey] as? Int, mx > 0 else { continue }
            return BatteryReading(
                percent: Int((Double(cur) * 100 / Double(mx)).rounded()),
                onAC: (d[kIOPSPowerSourceStateKey] as? String) == kIOPSACPowerValue,
                isCharging: d[kIOPSIsChargingKey] as? Bool ?? false)
        }
        return nil
    }
}

/// A sound that ships inside the app. Files live in Resources/sounds/ (tanki.* sits at the Resources root).
struct SoundPreset: Identifiable, Hashable {
    let id: String
    let name: String
    let file: String

    static let all: [SoundPreset] = [
        SoundPreset(id: "tanki", name: "Pani ki Tanki", file: "tanki"),
        SoundPreset(id: "ting", name: "Ting", file: "ting"),
        SoundPreset(id: "drop", name: "Water Drop", file: "drop"),
        SoundPreset(id: "bell", name: "Bell", file: "bell"),
        SoundPreset(id: "siren", name: "Siren", file: "siren"),
        SoundPreset(id: "success", name: "Success", file: "success"),
    ]
    static let `default` = all[0]

    static func with(id: String) -> SoundPreset? { all.first { $0.id == id } }

    var url: URL? {
        for ext in ["m4a", "mp3", "wav"] {
            if let u = Bundle.main.url(forResource: file, withExtension: ext, subdirectory: "sounds")
                ?? Bundle.main.url(forResource: file, withExtension: ext) { return u }
        }
        return nil
    }
}

final class BatteryMonitor: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    /// Re-arm once the battery falls this many points below the threshold.
    static let rearmMargin = 3

    private enum Keys {
        static let enabled = "enabled", threshold = "threshold", repeats = "repeats", soundPath = "soundPath"
        static let soundChoice = "soundChoice"
    }

    @Published private(set) var percent = 0
    @Published private(set) var pluggedIn = false
    @Published private(set) var charging = false
    @Published private(set) var hasBattery = true
    @Published private(set) var lastAlert: Date?
    @Published private(set) var isPlaying = false
    /// The preset being previewed from its row's play button, if any.
    @Published private(set) var previewing: String?

    @Published var enabled: Bool {
        didSet { defaults.set(enabled, forKey: Keys.enabled); evaluate() }
    }
    @Published var threshold: Double {
        didSet {
            guard threshold != oldValue else { return }
            defaults.set(threshold, forKey: Keys.threshold)
            // A new target that we're below re-arms the alert. Moving the slider down to (or under)
            // the current % while plugged in therefore fires immediately — handy for testing.
            if Double(percent) < threshold { fired = false }
            log("threshold -> \(Int(threshold))")
            evaluate()
        }
    }
    @Published var repeats: Int {
        didSet { defaults.set(repeats, forKey: Keys.repeats) }
    }
    @Published var soundPath: String? {
        didSet { defaults.set(soundPath, forKey: Keys.soundPath) }
    }
    /// "preset:<id>" or "custom".
    @Published var soundChoice: String {
        didSet { defaults.set(soundChoice, forKey: Keys.soundChoice); log("soundChoice -> \(soundChoice)") }
    }

    private let defaults = UserDefaults.standard
    private let debug = CommandLine.arguments.contains("--debug") || ProcessInfo.processInfo.environment["TANKI_DEBUG"] != nil
    private var player: AVAudioPlayer?
    private var playTimer: Timer?
    private var fired = false
    private var timer: Timer?
    private var runLoopSource: CFRunLoopSource?

    override init() {
        enabled = defaults.object(forKey: Keys.enabled) as? Bool ?? true
        threshold = min(100, max(50, defaults.object(forKey: Keys.threshold) as? Double ?? 100))
        repeats = min(5, max(1, defaults.object(forKey: Keys.repeats) as? Int ?? 2))
        soundPath = defaults.string(forKey: Keys.soundPath)
        // v1.0 had no soundChoice: someone who had picked a file keeps it.
        soundChoice = defaults.string(forKey: Keys.soundChoice)
            ?? (defaults.string(forKey: Keys.soundPath) != nil ? "custom" : "preset:\(SoundPreset.default.id)")
        super.init()
        defaults.set(soundChoice, forKey: Keys.soundChoice)

        let center = UNUserNotificationCenter.current()
        center.delegate = self
        center.requestAuthorization(options: [.alert, .sound]) { [weak self] ok, err in
            self?.log("notification auth: \(ok) \(err?.localizedDescription ?? "")")
        }

        // Instant updates from IOKit on any power-source change.
        let ctx = Unmanaged.passUnretained(self).toOpaque()
        if let src = IOPSNotificationCreateRunLoopSource({ ctx in
            guard let ctx else { return }
            let me = Unmanaged<BatteryMonitor>.fromOpaque(ctx).takeUnretainedValue()
            DispatchQueue.main.async { me.refresh() }
        }, ctx)?.takeRetainedValue() {
            runLoopSource = src
            CFRunLoopAddSource(CFRunLoopGetMain(), src, .defaultMode)
        }
        // Fallback poll in case a notification is missed.
        let t = Timer(timeInterval: 30, repeats: true) { [weak self] _ in self?.refresh() }
        RunLoop.main.add(t, forMode: .common)
        timer = t

        refresh()

        // Debug hook: `--set-threshold N` behaves exactly like dragging the slider to N.
        if let i = CommandLine.arguments.firstIndex(of: "--set-threshold"),
           i + 1 < CommandLine.arguments.count, let v = Double(CommandLine.arguments[i + 1]) {
            DispatchQueue.main.async { self.threshold = min(100, max(50, v)) }
        }
        // Debug hooks: `--select-sound preset:bell|custom` is the same as picking it in the popover,
        // `--test-sound` is the same as pressing Test Sound.
        if let i = CommandLine.arguments.firstIndex(of: "--select-sound"), i + 1 < CommandLine.arguments.count {
            soundChoice = CommandLine.arguments[i + 1]
        }
        if CommandLine.arguments.contains("--test-sound") {
            DispatchQueue.main.async { self.playSound() }
        }
    }

    var iconName: String {
        if pluggedIn { return "battery.100.bolt" }
        switch percent {
        case 88...: return "battery.100"
        case 63..<88: return "battery.75"
        case 38..<63: return "battery.50"
        case 13..<38: return "battery.25"
        default: return "battery.0"
        }
    }

    func refresh() {
        guard let r = BatteryReading.read() else {
            hasBattery = false
            log("no internal battery found")
            return
        }
        hasBattery = true
        if r.percent != percent || r.onAC != pluggedIn || r.isCharging != charging {
            log("battery \(r.percent)% onAC=\(r.onAC) charging=\(r.isCharging)")
        }
        percent = r.percent
        pluggedIn = r.onAC
        charging = r.isCharging
        evaluate()
    }

    private func evaluate() {
        if !pluggedIn || percent <= Int(threshold) - Self.rearmMargin {
            if fired { log("re-armed") }
            fired = false
            return
        }
        guard enabled, !fired, Double(percent) >= threshold else { return }
        fired = true
        lastAlert = Date()
        log("FIRED at \(percent)% (threshold \(Int(threshold)))")
        playSound()
        notify()
    }

    // MARK: Sound

    var selectedPreset: SoundPreset? {
        guard soundChoice.hasPrefix("preset:") else { return nil }
        return SoundPreset.with(id: String(soundChoice.dropFirst("preset:".count)))
    }

    var isCustom: Bool { soundChoice == "custom" }

    private var customFileOK: Bool {
        guard let p = soundPath else { return false }
        return FileManager.default.isReadableFile(atPath: p)
    }

    /// The selection first. A missing custom file (or an unknown preset) falls back to the default preset,
    /// then the system Glass sound.
    private var candidateSounds: [URL] {
        var urls: [URL] = []
        if isCustom, customFileOK, let p = soundPath { urls.append(URL(fileURLWithPath: p)) }
        if let u = selectedPreset?.url { urls.append(u) }
        if let u = SoundPreset.default.url { urls.append(u) }
        urls.append(URL(fileURLWithPath: "/System/Library/Sounds/Glass.aiff"))
        return urls
    }

    var soundDescription: String {
        if isCustom {
            guard let p = soundPath else { return "No file chosen – using \(SoundPreset.default.name)" }
            let name = URL(fileURLWithPath: p).lastPathComponent
            return customFileOK ? name : "\(name) (missing – using \(SoundPreset.default.name))"
        }
        return selectedPreset?.name ?? SoundPreset.default.name
    }

    func selectPreset(_ preset: SoundPreset) { soundChoice = "preset:\(preset.id)" }

    /// "Custom file…": uses the file you already chose, or asks for one.
    func selectCustom() {
        if soundPath != nil { soundChoice = "custom" } else { chooseSound() }
    }

    /// Plays the current selection `repeats` times (the alert itself and the Test Sound button).
    func playSound() {
        stopSound()
        for url in candidateSounds where start(url, loops: max(0, repeats - 1)) {
            log("playing \(url.lastPathComponent) x\(repeats)")
            return
        }
        NSSound.beep()
    }

    /// Plays one preset once, from its row's play button. Pressing it again stops it.
    func preview(_ preset: SoundPreset) {
        let same = previewing == preset.id
        stopSound()
        guard !same, let url = preset.url, start(url, loops: 0) else { return }
        previewing = preset.id
        log("preview \(url.lastPathComponent)")
    }

    private func start(_ url: URL, loops: Int) -> Bool {
        guard let p = try? AVAudioPlayer(contentsOf: url) else { log("cannot open \(url.path)"); return false }
        p.numberOfLoops = loops
        p.prepareToPlay()
        guard p.play() else { return false }
        player = p
        isPlaying = true
        let t = Timer(timeInterval: 0.25, repeats: true) { [weak self] t in
            guard let self else { t.invalidate(); return }
            if !(self.player?.isPlaying ?? false) {
                self.isPlaying = false
                self.previewing = nil
                t.invalidate()
                self.log("finished \(url.lastPathComponent)")
            }
        }
        RunLoop.main.add(t, forMode: .common)
        playTimer = t
        return true
    }

    func stopSound() {
        player?.stop()
        player = nil
        playTimer?.invalidate()
        isPlaying = false
        previewing = nil
    }

    func chooseSound() {
        NSApp.activate(ignoringOtherApps: true)
        let panel = NSOpenPanel()
        panel.title = "Choose alert sound"
        panel.allowedContentTypes = [.mp3, .mpeg4Audio, .wav]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        if panel.runModal() == .OK, let url = panel.url {
            soundPath = url.path
            soundChoice = "custom"
        }
    }

    /// The Reset link: forget the custom file and go back to the default preset.
    func resetSound() {
        soundPath = nil
        soundChoice = "preset:\(SoundPreset.default.id)"
    }

    // MARK: Notifications

    private func notify() {
        let c = UNMutableNotificationContent()
        c.title = "Tanki bhar gayi! 💧"
        c.body = "Battery is at \(percent)%. Unplug the charger."
        UNUserNotificationCenter.current().add(
            UNNotificationRequest(identifier: UUID().uuidString, content: c, trigger: nil)) { [weak self] err in
            self?.log("notification posted \(err.map { "error: \($0.localizedDescription)" } ?? "ok")")
        }
    }

    // Show the banner even while our (menu bar) app is frontmost.
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list])
    }

    private func log(_ s: @autoclosure () -> String) {
        guard debug else { return }
        let ts = ISO8601DateFormatter().string(from: Date())
        FileHandle.standardError.write("[TankiAlert \(ts)] \(s())\n".data(using: .utf8)!)
    }
}
