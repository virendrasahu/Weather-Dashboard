
const apiKey = "fc43e324cea97ace3d8cda18c4e9f33f"; //OpenWeatherMap API key

let searchInputEl = document.getElementById("searchInput");
let searchBtnEl = document.getElementById("searchBtn");
let currentWeatherEl = document.getElementById("currentWeather");
let forecastContainerEl = document.getElementById("forecastContainer");
let cityTitleEl = document.getElementById("cityTitle");

// 'metric' means Celsius
let unit = "metric";

//fetching weather data for a given city
function getWeatherData(city) {
    //fetch current weather and forecast
    let currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

    // Fetch current weather
    fetch(currentWeatherUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(function (data) {
            showCurrentWeather(data, city);
        })
        .catch(function (error) {
            alert("Error: " + error.message);
        });

    // Fetch 5-day forecast
    fetch(forecastUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Forecast not found");
            }
            return response.json();
        })
        .then(function (data) {
            showForecast(data.list);
        })
        .catch(function (error) {
            alert("Error: " + error.message);
        });

    // Save to localStorage (for history)
    saveToLocalStorage(city);
}

// Show current weather in the main card
function showCurrentWeather(data, city) {
    let date = new Date().toISOString().split("T")[0]; // today's date
    let iconCode = data.weather[0].icon;
    let temp = data.main.temp;
    let wind = data.wind.speed;
    let humidity = data.main.humidity;
    let desc = data.weather[0].description;

    cityTitleEl.textContent = `${city} - ${date}`;

    currentWeatherEl.innerHTML = `
        <div>
            <h1 class="cityTitle">${city} - ${date} </h1>
            <p>Temperature: ${temp}°C</p>
            <p>Wind: ${wind} m/s</p>
            <p>Humidity: ${humidity}%</p>
        </div>
        <div>
            <img class="main-image" src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">
            <p>${desc}</p>
        </div>
    `;
}

// Show 4-day forecast
function showForecast(forecastList) {
    forecastContainerEl.innerHTML = ""; // clear old data

    let filteredList = forecastList.filter(function (item) {
        return item.dt_txt.includes("12:00:00"); // mid-day forecasts only
    });

    for (let i = 0; i < 4; i++) {
        let forecast = filteredList[i];
        let date = forecast.dt_txt.split(" ")[0];
        let icon = forecast.weather[0].icon;
        let temp = forecast.main.temp;
        let wind = forecast.wind.speed;
        let humidity = forecast.main.humidity;

        let forecastCard = document.createElement("div");
        forecastCard.className = "card bg-info p-2 mr-2";

        forecastCard.innerHTML = `
            <h1 class="card-heading">(${date})</h1>
            <img class="card-image" src="https://openweathermap.org/img/wn/${icon}.png" alt="Forecast icon">
            <p class="card-para">Temp: ${temp}°C</p>
            <p class="card-para">Wind: ${wind} m/s</p>
            <p class="card-para">Humidity: ${humidity}%</p>
        `;

        forecastContainerEl.appendChild(forecastCard);
    }
}

// Save recent city to localStorage (limit to 5)
function saveToLocalStorage(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (!cities.includes(city)) {
        cities.unshift(city); // add to front
        if (cities.length > 5) {
            cities.pop(); // remove last if more than 5
        }
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
}

// When Search button is clicked
searchBtnEl.addEventListener("click", function () {
    let city = searchInputEl.value.trim();
    if (city !== "") {
        getWeatherData(city);
    } else {
        alert("Please enter a city name.");
    }
});
