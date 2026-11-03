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

final class BatteryMonitor: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    /// Re-arm once the battery falls this many points below the threshold.
    static let rearmMargin = 3

    private enum Keys {
        static let enabled = "enabled", threshold = "threshold", repeats = "repeats", soundPath = "soundPath"
    }

    @Published private(set) var percent = 0
    @Published private(set) var pluggedIn = false
    @Published private(set) var charging = false
    @Published private(set) var hasBattery = true
    @Published private(set) var lastAlert: Date?
    @Published private(set) var isPlaying = false

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
        super.init()

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

    /// User file → bundled tanki.* → system Glass.
    private var candidateSounds: [URL] {
        var urls: [URL] = []
        if let p = soundPath, FileManager.default.isReadableFile(atPath: p) { urls.append(URL(fileURLWithPath: p)) }
        for ext in ["mp3", "m4a", "wav"] {
            if let b = Bundle.main.url(forResource: "tanki", withExtension: ext) { urls.append(b) }
        }
        urls.append(URL(fileURLWithPath: "/System/Library/Sounds/Glass.aiff"))
        return urls
    }

    var soundDescription: String {
        if let p = soundPath {
            let name = URL(fileURLWithPath: p).lastPathComponent
            return FileManager.default.isReadableFile(atPath: p) ? name : "\(name) (missing – using fallback)"
        }
        if let first = candidateSounds.first, first.path.hasPrefix(Bundle.main.bundlePath) {
            return "Bundled \(first.lastPathComponent)"
        }
        return "System “Glass” sound"
    }

    func playSound() {
        stopSound()
        for url in candidateSounds {
            guard let p = try? AVAudioPlayer(contentsOf: url) else { log("cannot open \(url.path)"); continue }
            p.numberOfLoops = max(0, repeats - 1)
            p.prepareToPlay()
            if p.play() {
                player = p
                isPlaying = true
                log("playing \(url.lastPathComponent) x\(repeats)")
                let t = Timer(timeInterval: 0.5, repeats: true) { [weak self] t in
                    guard let self else { t.invalidate(); return }
                    if !(self.player?.isPlaying ?? false) { self.isPlaying = false; t.invalidate() }
                }
                RunLoop.main.add(t, forMode: .common)
                playTimer = t
                return
            }
        }
        NSSound.beep()
    }

    func stopSound() {
        player?.stop()
        player = nil
        playTimer?.invalidate()
        isPlaying = false
    }

    func chooseSound() {
        NSApp.activate(ignoringOtherApps: true)
        let panel = NSOpenPanel()
        panel.title = "Choose alert sound"
        panel.allowedContentTypes = [.mp3, .mpeg4Audio, .wav]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        if panel.runModal() == .OK, let url = panel.url { soundPath = url.path }
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
