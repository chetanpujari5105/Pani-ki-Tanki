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

            SoundPicker()

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
                    Button("Reset") { m.resetSound() }.buttonStyle(.link)
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

/// The "Sound" list: the built-in presets, each with a preview button, then "Custom file…".
struct SoundPicker: View {
    @EnvironmentObject var m: BatteryMonitor

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Sound")
            VStack(spacing: 0) {
                ForEach(SoundPreset.all) { p in
                    row(p.name, selected: m.selectedPreset == p, select: { m.selectPreset(p) }) {
                        Button { m.preview(p) } label: {
                            Image(systemName: m.previewing == p.id ? "stop.circle.fill" : "play.circle")
                                .font(.system(size: 14))
                                .foregroundStyle(m.previewing == p.id ? Color.accentColor : Color.secondary)
                                .frame(width: 20, height: 20)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.borderless)
                        .help(m.previewing == p.id ? "Stop" : "Preview \(p.name)")
                        .accessibilityLabel(m.previewing == p.id ? "Stop preview" : "Preview \(p.name)")
                    }
                }
                row("Custom file…", selected: m.isCustom, select: { m.selectCustom() }) { EmptyView() }
            }
            .padding(.vertical, 3)
            .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.06)))
        }
    }

    private func row<Trailing: View>(_ title: String, selected: Bool, select: @escaping () -> Void,
                                     @ViewBuilder trailing: () -> Trailing) -> some View {
        HStack(spacing: 6) {
            Button(action: select) {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .semibold))
                        .opacity(selected ? 1 : 0)
                        .frame(width: 12)
                    Text(title)
                    Spacer(minLength: 0)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityAddTraits(selected ? [.isSelected] : [])
            trailing()
        }
        .padding(.horizontal, 6)
        .frame(height: 22)
    }
}
