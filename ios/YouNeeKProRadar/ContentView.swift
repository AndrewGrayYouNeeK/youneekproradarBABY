import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var locationManager: LocationManager
    @StateObject private var forecastStore = ForecastStore()

    var body: some View {
        NavigationStack {
            Group {
                if let location = locationManager.location {
                    ForecastView(location: location, forecastStore: forecastStore)
                } else if let error = locationManager.errorMessage {
                    StatusView(
                        title: "Location needed",
                        message: error,
                        actionTitle: "Try Again",
                        action: { locationManager.requestLocation() }
                    )
                } else {
                    StatusView(
                        title: "YouNeeK Pro Radar",
                        message: "Getting your location for local forecasts…",
                        actionTitle: "Refresh",
                        action: { locationManager.requestLocation() }
                    )
                }
            }
            .navigationTitle("Forecast")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                locationManager.requestLocation()
            }
        }
        .preferredColorScheme(.dark)
    }
}

private struct StatusView: View {
    let title: String
    let message: String
    let actionTitle: String
    let action: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cloud.bolt.rain.fill")
                .font(.system(size: 48))
                .foregroundStyle(.green)
            Text(title)
                .font(.title2.bold())
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            Button(actionTitle, action: action)
                .buttonStyle(.borderedProminent)
                .tint(.green)
        }
        .padding()
    }
}

#Preview {
    ContentView()
        .environmentObject(LocationManager())
}
