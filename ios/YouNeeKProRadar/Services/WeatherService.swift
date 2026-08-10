import Foundation
import WeatherKit
import CoreLocation

@MainActor
final class ForecastStore: ObservableObject {
    @Published var weather: Weather?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let weatherKit = WeatherKit.WeatherService.shared

    func load(for location: CLLocation) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            weather = try await weatherKit.weather(for: location)
        } catch {
            errorMessage = """
            Could not load WeatherKit data. Enable WeatherKit for your App ID in the Apple Developer portal and select your development team in Xcode.
            (\(error.localizedDescription))
            """
        }
    }
}
