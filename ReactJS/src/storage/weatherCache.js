const CACHE_TIME = 30 * 60 * 1000;
const CACHE_KEY = "weatherCache";
const LAST_CITY_KEY = "lastWeatherCity";

function readCacheStore() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

export function getCachedWeather(city) {
  const entry = readCacheStore()[city.toLowerCase()];
  return entry && Date.now() - entry.time < CACHE_TIME ? entry.data : null;
}

export function saveCachedWeather(city, data) {
  const cache = readCacheStore();
  const now = Date.now();

  Object.keys(cache).forEach((key) => {
    if (now - cache[key].time >= CACHE_TIME) delete cache[key];
  });

  cache[city.toLowerCase()] = { city, time: now, data };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getLastWeatherCity() {
  return localStorage.getItem(LAST_CITY_KEY) || null;
}

export function saveLastWeatherCity(city) {
  localStorage.setItem(LAST_CITY_KEY, city);
}
