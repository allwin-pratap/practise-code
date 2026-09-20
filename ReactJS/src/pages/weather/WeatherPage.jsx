import { useEffect, useState } from "react";
import { canMakeWeatherRequest } from "@/storage/apiUsage";
import {
  getCachedWeather,
  getLastWeatherCity,
  saveCachedWeather,
  saveLastWeatherCity,
} from "@/storage/weatherCache";
import { fetchWeather } from "@/services/weatherApi";
import { formatLocalTime } from "@/utils/weather";
import ForecastCard from "@/pages/weather/ForecastCard";

const DEFAULT_CITY = "Chennai";

export default function WeatherPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(
    () => getLastWeatherCity() || DEFAULT_CITY,
  );
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("Loading forecast...");
  const [error, setError] = useState("");

  async function loadWeather(nextCity) {
    const cleanCity = nextCity.trim();
    if (!cleanCity) return;

    setStatus(`Checking ${cleanCity}...`);
    setError("");

    const cached = getCachedWeather(cleanCity);
    if (cached) {
      console.info(`[Weather] ${cleanCity}: data loaded from cache`);
      saveLastWeatherCity(cleanCity);
      setCity(cleanCity);
      setWeather(cached);
      setStatus("Data from your local cache · refreshes every 30 minutes");
      return;
    }

    if (!canMakeWeatherRequest()) {
      setError("Daily request limit reached. Try again tomorrow.");
      setStatus("");
      return;
    }

    try {
      console.info(`[Weather] ${cleanCity}: fetching fresh data from API`);
      const data = await fetchWeather(cleanCity);
      saveCachedWeather(cleanCity, data);
      saveLastWeatherCity(cleanCity);
      setCity(cleanCity);
      setWeather(data);
      setStatus("Live data · cached locally for 30 minutes");
    } catch (requestError) {
      console.error(`[Weather] ${cleanCity}: API request failed`, requestError);
      setError(requestError.message);
      setStatus("");
    }
  }

  useEffect(() => {
    const lastSearchedCity = getLastWeatherCity() || DEFAULT_CITY;
    loadWeather(lastSearchedCity);
  }, []);

  const forecast = weather?.forecast?.forecastday?.slice(1, 3) || [];

  return (
    <main className="weather-page">
      <section className="weather-heading">
        <div>
          <h1>🌤️ Weather App</h1>
          <p>Check the current weather and forecast</p>
        </div>
      </section>
      <section>
        <form
          className="weather-search"
          onSubmit={(event) => {
            event.preventDefault();
            loadWeather(query);
          }}
        >
          <label htmlFor="city-search">Search a city</label>
          <div>
            <input
              id="city-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Mumbai or Tokyo"
            />
            <button type="submit">Search</button>
          </div>
        </form>
        {status && <p className="request-status">{status}</p>}
        {error && <p className="request-error">{error}</p>}
        {weather && (
          <>
            <section className="current-panel">
              <div className="location-block">
                <p className="eyebrow">Current location</p>
                <h2>{weather.location.name}</h2>
                <p>
                  {weather.location.region}, {weather.location.country}
                </p>
                <small>{formatLocalTime(weather.location.localtime)}</small>
              </div>
              <div className="current-reading">
                <img
                  className="current-icon"
                  src={`https:${weather.current.condition.icon}`}
                  alt={weather.current.condition.text}
                />
                <div>
                  <strong>{Math.round(weather.current.temp_c)}°</strong>
                  <p>{weather.current.condition.text}</p>
                  <small>
                    Feels like {Math.round(weather.current.feelslike_c)}°
                  </small>
                </div>
              </div>
              <div className="sun-details">
                <div>
                  <span>Sunrise</span>
                  <strong>
                    {weather.forecast.forecastday[0].astro.sunrise}
                  </strong>
                </div>
                <div>
                  <span>Sunset</span>
                  <strong>
                    {weather.forecast.forecastday[0].astro.sunset}
                  </strong>
                </div>
              </div>
            </section>
            <section className="ai-card">
              <div className="ai-card-icon">✦</div>
              <div>
                <p className="ai-card-label">AI weather companion</p>
                <h2>Ask the forecast a real-world question.</h2>
                <p className="ai-card-copy">
                  Soon you will be able to ask things like “Do I need a raincoat
                  in Bangalore tomorrow?” and get a clear answer based on the
                  selected location and forecast.
                </p>
              </div>
              <span className="ai-card-status">Coming soon</span>
            </section>
            <section className="forecast-section">
              <div className="section-heading">
                <h2>📅 Next 2 Days</h2>
              </div>
              <div className="forecast-grid">
                {forecast.map((day) => (
                  <ForecastCard key={day.date} day={day} />
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
