import SwiftUI
import ServiceManagement

struct ContentView: View {
    @EnvironmentObject var m: BatteryMonitor
    @State private var launchAtLogin = SMAppService.mainApp.status == .enabled
    @State private var loginError: String?

    private var statusText: String {
        guard m.hasBattery else { return "No battery found" }
        if m.charging { return "\(m.percent)% · ⚡ charging" }
        if m.pluggedIn { return "\(m.percent)% · 🔌 on AC, not charging" }
        return "\(m.percent)% · on battery"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(nsImage: NSApplication.shared.applicationIconImage)
                    .resizable()
                    .frame(width: 32, height: 32)
                Text("TankiAlert").font(.title3.bold())
            }
            Text(statusText).font(.headline).monospacedDigit()

            Toggle("Alert enabled", isOn: $m.enabled)

            VStack(alignment: .leading, spacing: 4) {
                Text("Alert at \(Int(m.threshold))%").monospacedDigit()
                Slider(value: $m.threshold, in: 50...100, step: 1)
            }

            Stepper("Play sound \(m.repeats)×", value: $m.repeats, in: 1...5)

            HStack {
                Button("Choose Sound…") { m.chooseSound() }
                if m.isPlaying {
                    Button("Stop") { m.stopSound() }
                } else {
                    Button("Test Sound") { m.playSound() }
                }
            }
            HStack(spacing: 4) {
                Text(m.soundDescription).lineLimit(1).truncationMode(.middle)
                if m.soundPath != nil {
                    Button("Reset") { m.soundPath = nil }.buttonStyle(.link)
                }
            }
            .font(.caption).foregroundStyle(.secondary)

            if let last = m.lastAlert {
                Text("Last alert: \(last.formatted(date: .omitted, time: .shortened))")
                    .font(.caption).foregroundStyle(.secondary)
            }

            Toggle("Launch at login", isOn: Binding(get: { launchAtLogin }, set: setLaunchAtLogin))
            if let loginError {
                Text(loginError).font(.caption).foregroundStyle(.red)
            }

            Divider()
            Button("Quit TankiAlert") { NSApplication.shared.terminate(nil) }
                .keyboardShortcut("q")
        }
        .padding()
        .frame(width: 280)
        .onAppear {
            m.refresh()
            launchAtLogin = SMAppService.mainApp.status == .enabled
        }
    }

    private func setLaunchAtLogin(_ on: Bool) {
        do {
            if on { try SMAppService.mainApp.register() } else { try SMAppService.mainApp.unregister() }
            loginError = nil
        } catch {
            loginError = error.localizedDescription
        }
        launchAtLogin = SMAppService.mainApp.status == .enabled
    }
}
