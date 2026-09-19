# Weather App

A small HTML, CSS, and JavaScript weather app that uses WeatherAPI.

## API Used

The app calls the WeatherAPI forecast endpoint:

```text
https://api.weatherapi.com/v1/forecast.json
```

The response provides:

- Current temperature and condition
- Feels-like temperature
- Local time
- Sunrise and sunset
- Forecast information for the next two days

## Features

- Search weather by city
- Display the city, region, and local time
- Show temperature, condition, and feels-like temperature
- Show sunrise and sunset
- Show maximum, minimum, and average temperatures
- Show rain chance and total precipitation
- Limit uncached API requests to 20 per day
- Cache each city's weather data for 30 minutes
- Remove expired city data during cache cleanup

## Original API Problem

The first version called the API whenever the page loaded or the user searched. This caused unnecessary requests and could quickly use the account's limited API allowance.

The first security problem was also that the API key was placed directly in `script.js`. Anyone can inspect browser JavaScript, so this key must not be treated as private.

## Problem Statement

The WeatherAPI account has a limited number of API requests. If every button click and page refresh sends a new request, users can quickly use all available requests.

For example, these actions should not create unnecessary API calls:

1. A user refreshes the page several times for the same city.
2. A user searches for Chennai again within a short time.
3. A user switches from Mumbai to Chennai, even though Chennai data is already available locally.

The goal is to reduce unnecessary requests while still showing reasonably fresh weather data.

## Solution Design

The solution uses two `localStorage` features:

1. A daily API request limit of 20 requests.
2. A shared cache object containing 30-minute data for each searched city.

The order is important:

```text
Search city
	|
	v
Is fresh cached data available?
	| yes                    | no
	v                        v
Show cached data       Check daily limit
							 |
					limit reached? -> Stop
							 |
							 v
					 Call WeatherAPI
							 |
							 v
				  Save response for that city
```

If cached data is available, the app returns immediately. Therefore, cached searches do not use the daily API limit.

## Step 1: Limit Requests Per Day

The counter is saved in `localStorage`, so it survives page refreshes.

```javascript
const MAX_HITS_PER_DAY = 10;

function canMakeApiCall() {
	const today = new Date().toDateString();
	const usage = JSON.parse(
		localStorage.getItem("weatherApiUsage")
	) || { count: 0, date: today };

	if (usage.date !== today) {
		usage.count = 0;
		usage.date = today;
	}

	if (usage.count >= MAX_HITS_PER_DAY) {
		alert("Daily search limit reached. Try again tomorrow.");
		return false;
	}

	usage.count += 1;
	localStorage.setItem(
		"weatherApiUsage",
		JSON.stringify(usage)
	);

	return true;
}
```

### How the Counter Works

- The key is `weatherApiUsage`.
- It stores the request `count` and the current `date`.
- On a new day, the count resets to zero.
- On the twenty-first uncached request, the API call is stopped.

## Step 2: Cache Weather Data for 30 Minutes

Weather data for all cities is stored inside one `weatherCache` object. The city name becomes a property inside that object:

```javascript
const cityKey = city.toLowerCase();
const masterCache = JSON.parse(
	localStorage.getItem("weatherCache")
) || {};

const cached = masterCache[cityKey];
const now = Date.now();
const CACHE_TIME = 30 * 60 * 1000;

if (cached && now - cached.time < CACHE_TIME) {
	updateWeather(cached.data);
	return;
}
```

The `return` is important. It stops the function before the daily limit check and before `fetch()`.

## Step 3: Save New API Responses

When the cache is missing or older than 30 minutes, the app checks the daily limit and calls WeatherAPI:

```javascript
if (!canMakeApiCall()) return;

const response = await fetch(url);
const data = await response.json();

masterCache[cityKey] = {
	city: city,
	time: Date.now(),
	data: data
};

localStorage.setItem("weatherCache", JSON.stringify(masterCache));

updateWeather(data);
```

## Why Each City Needs Its Own Cache

A single value for only the latest city would cause old data to be shown incorrectly. The current solution keeps multiple cities in one object, using the normalized city name as the property key:

```text
weatherCache: {
	chennai: {...},
	mumbai: {...},
	thailand: {...}
}
```

This makes the flow work correctly:

```text
Chennai -> API call -> save cache.chennai
Mumbai  -> API call -> save cache.mumbai
Chennai -> read cache.chennai -> no API call
Thailand -> API call -> save cache.thailand
```

If Chennai's cache is less than 30 minutes old, the user sees the cached result. If it is older, the app makes a new request and replaces the old Chennai cache.

## Step 4: Remove Expired Cache Entries

Before saving a new response, the app loops through the shared cache and removes entries older than 30 minutes:

```javascript
for (const key in masterCache) {
	if (now - masterCache[key].time >= CACHE_TIME) {
		delete masterCache[key];
	}
}
```

This prevents old city data from staying in `localStorage` forever and keeps the cache small.

## Important Limitations

`localStorage` is useful for reducing requests from one browser, but it is not a secure global rate limiter:

- Each browser and device has its own counter.
- A user can clear storage or use another browser.
- A user can edit the stored values in developer tools.
- Multiple users can still exceed the account limit together.

For a production application, enforce the request limit on a backend server and keep the WeatherAPI key there. The current key is exposed in browser JavaScript, so it should be revoked and regenerated before production use.

## Major Issues To Fix Later

1. Move the WeatherAPI request to a backend so the API key is private.
2. Enforce the daily limit on the backend so users cannot reset it by clearing `localStorage`.
3. Handle invalid cities, failed requests, and API rate-limit responses with user-friendly messages.
4. Store the cache on the server if multiple users should share cached results.
5. Request enough forecast days for every forecast card. The current request uses `days=2`, but the code reads `forecastday[2]`, which requires a third forecast day.

## Run Locally

Open the project with VS Code Live Server. Do not open `index.html` directly with the `file://` protocol.
