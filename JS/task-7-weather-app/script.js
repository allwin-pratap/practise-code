API_KEY = "a40e268ce0d14280b70133755261909"

let searchInput = document.getElementById("city-input");
let searchButton = document.getElementById("search-button");


//prevent exceeding the limit of API calls per day
// Prevent exceeding the limit of API calls per day
const MAX_HITS_PER_DAY = 20;

function canMakeApiCall() {
    const today = new Date().toDateString();
    const storedData = JSON.parse(localStorage.getItem('weatherApiUsage')) || { count: 0, date: today };

    // If it's a new day, reset the count
    if (storedData.date !== today) {
        storedData.count = 0;
        storedData.date = today;
    }

    // Check if they exceeded the limit
    if (storedData.count >= MAX_HITS_PER_DAY) {
        alert("You have reached your daily search limit. Please try again tomorrow.");
        return false; // Prevent the API call
    }

    // Increment and save
    storedData.count += 1;
    localStorage.setItem('weatherApiUsage', JSON.stringify(storedData));

    return true; // Allow the API call
}

searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
})

getWeatherData("Chennai");
async function getWeatherData(city) {
    const cityKey = city.toLowerCase();
    // 1. Check local storage for cached data
    // const cacheKey = `weatherCache_${city.toLowerCase()}`;
    // const cached = JSON.parse(localStorage.getItem(cacheKey));
    let masterCache = JSON.parse(localStorage.getItem('weatherCache')) || {};
    const now = Date.now();

    // 2. If cache exists, matches the city, and is less than 30 mins (1,800,000 ms) old
        if (
            masterCache[cityKey] && 
            masterCache[cityKey].city.toLowerCase() === city.toLowerCase() && 
            (now - masterCache[cityKey].time < 1800000)
        ) {
            console.log(`Loaded ${city} from cache! (No API hit)`);
            updateWeather(masterCache[cityKey].data);
            return; // Stop here so it doesn't run the rate limiter or hit the API
        }

    // 3. Cache is invalid/missing. Check daily API limit before fetching.
    if (!canMakeApiCall()) return;

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=2&aqi=no&alerts=no`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        // 4. Housekeeping: Loop through the cache and delete any expired cities 
        // to prevent the object from growing infinitely over time.
        for (const key in masterCache) {
            if (now - masterCache[key].time >= 1800000) {
                delete masterCache[key];
            }
        }
        masterCache[cityKey] = {
            city: city,
            time: now,
            data: data
        };
        localStorage.setItem('weatherCache', JSON.stringify(masterCache));
        updateWeather(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}
function updateWeather(data) {
    document.getElementById("city").innerText =
        data.location.name;
    document.getElementById("region").innerText =
        `${data.location.region}, ${data.location.country}`;
    const [datePart, timePart] = data.location.localtime.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    const formattedLocalTime = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(localDate).replace(", ", ", ").replace(" at ", " · ");
    document.getElementById("localTime").innerText =
        formattedLocalTime;
    // Current Weather
    document.getElementById("temperature").innerText =
        `${data.current.temp_c}°C`;
    document.getElementById("condition").innerText =
        data.current.condition.text;
    document.getElementById("feelsLike").innerText =
        `Feels like ${data.current.feelslike_c}°C`;
    document.getElementById("weatherIcon").innerText =
        "🌤️";
    // Sun
    document.getElementById("sunrise").innerText =
        data.forecast.forecastday[0].astro.sunrise;
    document.getElementById("sunset").innerText =
        data.forecast.forecastday[0].astro.sunset;
    // Next 2 Days
    updateForecast(
        data.forecast.forecastday[1],
        1
    );
    updateForecast(
        data.forecast.forecastday[2],
        2
    );
}

// Update forecast card
function updateForecast(day, number) {
    document.getElementById(`forecastDay${number}`).innerText =
        getDayName(day.date);
    document.getElementById(`forecastCondition${number}`).innerText =
        day.day.condition.text;
    document.getElementById(`maxTemp${number}`).innerText =
        `${day.day.maxtemp_c}°C`;
    document.getElementById(`minTemp${number}`).innerText =
        `${day.day.mintemp_c}°C`;
    document.getElementById(`avgTemp${number}`).innerText =
        `${day.day.avgtemp_c}°C`;
    document.getElementById(`rainChance${number}`).innerText =
        `${day.day.daily_chance_of_rain}%`;
    document.getElementById(`precip${number}`).innerText =
        `${day.day.totalprecip_mm} mm`;
}

function getDayName(date) {
    const day = new Date(date);
    return day.toLocaleDateString("en-US", {
        weekday: "long"
    });
}