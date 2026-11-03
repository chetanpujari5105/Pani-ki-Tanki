import SwiftUI

@main
struct TankiAlertApp: App {
    @StateObject private var monitor = BatteryMonitor()

    init() {
        // `TankiAlert --print-battery` prints the IOKit reading and exits (used to compare with `pmset -g batt`).
        if CommandLine.arguments.contains("--print-battery") {
            if let r = BatteryReading.read() {
                print("percent=\(r.percent) onAC=\(r.onAC) charging=\(r.isCharging)")
            } else {
                print("no internal battery")
            }
            exit(0)
        }
    }

    var body: some Scene {
        MenuBarExtra {
            ContentView().environmentObject(monitor)
        } label: {
            Image(systemName: monitor.iconName)
        }
        .menuBarExtraStyle(.window)
    }
}
