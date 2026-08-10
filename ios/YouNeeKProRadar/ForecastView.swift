import SwiftUI
import CoreLocation
import WeatherKit

struct ForecastView: View {
    let location: CLLocation
    @ObservedObject var forecastStore: ForecastStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if forecastStore.isLoading && forecastStore.weather == nil {
                    ProgressView("Loading WeatherKit forecast…")
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if let error = forecastStore.errorMessage {
                    StatusCard(
                        title: "Forecast unavailable",
                        message: error,
                        systemImage: "exclamationmark.triangle.fill"
                    )
                } else if let weather = forecastStore.weather {
                    CurrentWeatherCard(current: weather.currentWeather, daily: weather.dailyForecast.first)
                    HourlyForecastRow(hours: Array(weather.hourlyForecast.prefix(24)))
                    DailyForecastList(days: Array(weather.dailyForecast.prefix(7)))
                }
            }
            .padding()
        }
        .background(Color.black.ignoresSafeArea())
        .task(id: location.coordinate) {
            await forecastStore.load(for: location)
        }
        .refreshable {
            await forecastStore.load(for: location)
        }
    }
}

private struct CurrentWeatherCard: View {
    let current: CurrentWeather
    let daily: DayWeather?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Current")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(current.temperature.formatted())
                        .font(.system(size: 64, weight: .thin))
                    Text(current.condition.description)
                        .font(.headline)
                    Text("Feels like \(current.apparentTemperature.formatted())")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: current.symbolName)
                    .font(.system(size: 56))
                    .symbolRenderingMode(.multicolor)
            }

            if let daily {
                HStack {
                    Label("H \(daily.highTemperature.formatted())", systemImage: "thermometer.sun")
                    Label("L \(daily.lowTemperature.formatted())", systemImage: "thermometer.snowflake")
                    Label("\(current.wind.speed.formatted()) \(current.wind.compassDirection)", systemImage: "wind")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 20).fill(Color.white.opacity(0.08)))
    }
}

private struct HourlyForecastRow: View {
    let hours: [HourWeather]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Next 24 Hours")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(Array(hours.enumerated()), id: \.offset) { index, hour in
                        VStack(spacing: 8) {
                            Text(index == 0 ? "Now" : hour.date.formatted(.dateTime.hour()))
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Image(systemName: hour.symbolName)
                                .symbolRenderingMode(.multicolor)
                            Text(hour.temperature.formatted())
                                .font(.subheadline.weight(.semibold))
                            Text("\(Int((hour.precipitationChance * 100).rounded()))%")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .frame(width: 64)
                        .padding(.vertical, 10)
                        .background(RoundedRectangle(cornerRadius: 14).fill(Color.white.opacity(0.06)))
                    }
                }
            }
        }
    }
}

private struct DailyForecastList: View {
    let days: [DayWeather]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("7-Day Forecast")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            VStack(spacing: 0) {
                ForEach(Array(days.enumerated()), id: \.offset) { index, day in
                    HStack {
                        Text(index == 0 ? "Today" : day.date.formatted(.dateTime.weekday(.abbreviated)))
                            .frame(width: 56, alignment: .leading)
                        Image(systemName: day.symbolName)
                            .symbolRenderingMode(.multicolor)
                        Spacer()
                        Text("\(Int((day.precipitationChance * 100).rounded()))%")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .frame(width: 36)
                        Text(day.highTemperature.formatted())
                            .font(.subheadline.weight(.semibold))
                        Text(day.lowTemperature.formatted())
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 10)

                    if index < days.count - 1 {
                        Divider().overlay(Color.white.opacity(0.08))
                    }
                }
            }
            .padding(.horizontal)
            .background(RoundedRectangle(cornerRadius: 20).fill(Color.white.opacity(0.06)))
        }
    }
}

private struct StatusCard: View {
    let title: String
    let message: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: systemImage)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.orange.opacity(0.15)))
    }
}
