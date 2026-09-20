export async function fetchWeather(city) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Add VITE_WEATHER_API_KEY to .env.local and restart the dev server.",
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: city,
    days: "3",
    aqi: "no",
    alerts: "no",
  });

  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?${params}`,
  );
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Weather request failed");
  }

  return data;
}
