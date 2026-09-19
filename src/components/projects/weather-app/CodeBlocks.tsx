import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Props {
  open: boolean;
  onToggle: () => void;
}

const htmlString = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Weather App</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="weather-container">
      <h1>Weather App <tagline>with 5 day forecast</tagline></h1>
      <label for="search_input">
        <input
          type="text"
          name="city"
          id="search_input"
          placeholder="Enter a City"
        />
      </label>
      <input type="submit" value="Go!" onclick="getData()" />
      <div id="weatherOutput"></div>
      <div id="forecastOutput"></div>
    </div>
    <script src="script.js"></script>
    <script
      type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=activatePlacesSearch"
      async
      defer>
    </script>
  </body>
</html>`;

const jsString = `const weatherURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast";
const YOUR_OPENWEATHER_API_KEY = "HERE";

const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function activatePlacesSearch() {
  const input = document.getElementById("search_input");
  const options = { types: ["(cities)"] };
  const autocomplete = new google.maps.places.Autocomplete(input, options);
}

const getData = () => {
  let searchTerm = document.getElementById("search_input");
  let result = searchTerm.value.split(",");
  searchTerm.value = ""; // reset input field

  // get the chosen city's current weather
  fetch(\`\${weatherURL}/?q=\${result}&APPID=\${YOUR_OPENWEATHER_API_KEY}\`)
    .then(response => {
    if (response.status !== 200) {
      console.log(
        \`Looks like there was a problem... STATUS CODE: \${response.status}\`
      );
      const weatherOutput = document.getElementById("weatherOutput");
      weatherOutput.innerHTML = \`
        <p class="error-msg">Looks like there was a problem... Please try again.</p>
      \`;
      const forecastOutput = document.getElementById("forecastOutput");
      forecastOutput.innerHTML = "";
      return;
    }
    response
      .json()
      .then(data => {
        appendWeather(data);
      })
      .catch(err => {
        console.log(err);
      });
  });
  const appendWeather = data => {
    let icon = data.weather[0].icon;
    let date = new Date();
    const weatherOutput = document.getElementById("weatherOutput");
    weatherOutput.innerHTML += \`
    <h2>\${data.name}, \${data.sys.country}</h2>
    <p class="date-time">
      \${days[date.getDay()]}
      \${date.getDate()}
      \${months[date.getMonth()]}.
      \${(date.getHours() + 24) % 12 || 12}:\${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  }
      \${date.getHours() > 12 ? "PM" : "AM"},
      <span class="weather-conditions">\${data.weather[0].description}</span>
    </p>
    <div class="current-weather-wrapper">
      <div class="row-1">
        <span class="currentTemp">\${parseFloat(data.main.temp - 273.15).toFixed(
          1
        )}&#8451;</span>
        <span class='weather-icon'><img src="https://openweathermap.org/img/wn/\${icon}@2x.png" /></span>
      </div>

      <div class='row-2'>
        <span class="wind-speed">Wind: \${Math.round(
          data.wind.speed * 3.6
        )} Km/h</span>
        <span class="humidity">Humidity: \${data.main.humidity}%</span>
      </div>
    </div>
    \`;
  };

  // get the chosen city's 5 day forecast
  fetch(\`\${forecastURL}/?q=\${result}&APPID=\${YOUR_OPENWEATHER_API_KEY}\`).then(response => {
    if (response.status !== 200) {
      console.log(
        \`Looks like there was a problem... STATUS CODE: \${response.status}\`
      );
      return;
    }
    response
      .json()
      .then(forecast => {
        appendForecast(forecast);
      })
      .catch(err => {
        console.log(err);
      });
  });
  const appendForecast = forecast => {
    const forecastOutput = document.getElementById("forecastOutput");
    forecastOutput.innerHTML += \`
    <h4>5 day forecast</h4>
    <div class='forecast'>\`;
    for (let i = 1; i < forecast.list.length; i++) {
      let day = new Date(forecast.list[i].dt * 1000).getDay();
      let date = new Date(forecast.list[i].dt * 1000).getDate();
      if (forecast.list[i].dt_txt.includes("12:00:00")) {
        forecastOutput.innerHTML += \`
      <div class="day-data">
        <div class='day'>
            \${shortDays[day]}
            \${date < 10 ? "0" + date : date}
          </div>
          <div class='icon'>
            <img src="https://openweathermap.org/img/wn/\${
              forecast.list[i].weather[0].icon
            }@2x.png" />
          </div>
          <div class='temps'>\${parseFloat(
            forecast.list[i].main.temp - 273.15
          ).toFixed(1)}
          </div>
        </div>
      </div>
      \`;
      }
    }
    forecastOutput.innerHTML += \`
    <footer>
      <div class="widget-left-menu__links"><span>Powered by </span><a href="//openweathermap.org/" target="_blank" class="widget-left-menu__link">OpenWeatherMap</a></div>
    </footer>\`;
  };
};

// remove search input data, weather data + forecast data from page on :focus
let search_input = document.getElementById("search_input");
let fetched_data = document.getElementById("output");
search_input.onfocus = () => {
  weatherOutput.innerHTML = "";
  forecastOutput.innerHTML = "";
};
`;

const cssString = `.weather-container {
  position: relative;
  margin: 0 auto;
  max-width: 400px;
  padding: 1px 20px 25px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: rgba(19, 146, 180, 0.25);
  color: rgba(77, 78, 81, 0.85);
  font-weight: 500;
}
.weather-container h1 {
  font-size: 1.8rem;
}
tagline {
  font-size: 1rem;
  font-style: italic;
  font-weight: 400;
}
.weather-container h2 {
  color: rgba(77, 78, 81, 0.85);
}
.date-time {
  position: relative;
  bottom: 20px;
  font-size: 0.9rem;
  color: dimgrey;
}
span.weather-conditions {
  text-transform: capitalize;
  font-style: italic;
  color: #484848;
  font-weight: 600;
}
.current-weather-wrapper {
  position: relative;
  bottom: 26px;
}
.row-1,
.row-2 {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: Montserrat, sans-serif;
}
span.currentTemp {
  position: relative;
  font-size: 40px;
  bottom: 2px;
}
label {
  display: inline-block;
}
input#search_input {
  position: relative;
  display: block;
  height: 30px;
  width: 240px;
  font-size: 18px;
}
input[type="submit"] {
  background-color: rgb(51, 89, 153);
  border: 1px solid rgb(51, 89, 153);
  color: white;
  padding: 6px 8px;
  text-decoration: none;
  cursor: pointer;
  font-size: 1.1rem;
}
#forecastOutput {
  position: relative;
  top: 10px;
}
#forecastOutput h4 {
  position: relative;
  margin: 0 auto;
  text-align: center;
  text-transform: capitalize;
  font-size: 1.2rem;
}
.forecast {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.day-data {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 0.7;
}
.day {
  min-width: 60px;
}
.icon img {
  max-width: 60px;
}
.temps {
  min-width: 60px;
  text-align: right;
}
footer {
  padding-top: 20px;
  margin-bottom: 10px;
}
.widget-left-menu__links {
  float: right;
  position: relative;
}
.widget-left-menu__links span {
  font-weight: 600;
  color: #484848;
  opacity: 0.75;
  font-size: 0.85rem;
}
.widget-left-menu__link:before {
  content: "";
  width: 14px;
  height: 14px;
  background:
    url(https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/logo-black-owm.svg)
    50% 50% no-repeat;
  background-size: 14px 14px;
  padding-right: 17px;
}
.widget-left-menu__link {
  font-weight: 600;
  color: #484848;
  text-decoration: none;
  opacity: 0.75;
  font-size: 0.85rem;
}
p.error-msg {
  margin-top: 40px;
  text-align: center;
  color: #ff0000;
  font-weight: 600;
}
`;

export default function CodeBlocks({ open, onToggle }: Props) {
  return (
    <section className={open ? 'code is-open' : 'code is-closed'}>
      <p>
        The code displayed below is from my original iteration in HTML, CSS and JS.
      </p>
      <div className="code-header">index.html</div>
      <SyntaxHighlighter language="html" style={atomDark}>
        {htmlString}
      </SyntaxHighlighter>
      <div className="code-header">script.js</div>
      <SyntaxHighlighter language="javascript" style={atomDark}>
        {jsString}
      </SyntaxHighlighter>
      <div className="code-header">styles.css</div>
      <SyntaxHighlighter language="css" style={atomDark}>
        {cssString}
      </SyntaxHighlighter>
      <br />
      <span className="btn-widget-code">
        <button className="btn-toggle-code-bottom" onClick={onToggle}>
          {open ? 'Hide the code' : 'Show me the code'}
        </button>
      </span>
      <br />
      <a href="/projects" className="backBtn btnLink">
        Back to Projects
      </a>
      <section style={{ height: '60px' }} />
    </section>
  );
}
