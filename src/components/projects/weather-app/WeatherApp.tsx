import { useEffect, useRef, useState } from 'react';
import styles from './WeatherApp.module.css';

declare global {
  interface Window {
    google?: any;
  }
}

const weatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const forecastURL = 'https://api.openweathermap.org/data/2.5/forecast';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// google.maps.places.AutocompleteSuggestion / Place — the classes
// google.maps.places.AutocompleteService / PlacesService (used here
// previously) were replaced by, as of March 2025 they're no longer
// available to new API keys/projects at all. See
// https://developers.google.com/maps/documentation/javascript/places-migration-overview
interface Suggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    toPlace: () => any;
  };
}

export default function WeatherApp() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Holds the `places` library namespace (window.google.maps.places) once
  // it's ready, rather than a service instance — the new API is a set of
  // static/class methods, not an object you construct once and reuse.
  const placesLibrary = useRef<any>(null);
  // Tracks the most recently typed value so a slow, out-of-order response
  // to an earlier keystroke can't clobber newer suggestions.
  const latestQuery = useRef('');

  useEffect(() => {
    setMounted(true);
    setAddress('Toronto, ON, Canada');

    const initPlacesLibrary = () => {
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        placesLibrary.current = window.google.maps.places;
      }
    };

    // The Maps script (loaded from the page) may already be ready, or may
    // still be loading — either way, pick it up as soon as it's available.
    initPlacesLibrary();
    window.addEventListener('google-maps-loaded', initPlacesLibrary);
    return () => window.removeEventListener('google-maps-loaded', initPlacesLibrary);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.weatherContainer}>
        <h1>Loading Weather App...</h1>
      </div>
    );
  }

  const handleClick = () => {
    // literal "weatherOutput" class kept per audit P7 so this lookup keeps working
    const weatherOutput = document.getElementsByClassName('weatherOutput')[0];
    const forecastOutput = document.getElementById('forecastOutput');
    if (weatherOutput) weatherOutput.innerHTML = '';
    if (forecastOutput) forecastOutput.innerHTML = '';
    setAddress('');
    setCoordinates({ lat: null, lng: null });
    setShowSuggestions(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    latestQuery.current = value;

    if (value.length > 2 && placesLibrary.current) {
      try {
        const { suggestions: results } = await placesLibrary.current.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          {
            input: value,
            // Closest equivalent of the old `types: ['(cities)']` filter
            // in the new type taxonomy — see the migration guide linked
            // above if this needs tightening/loosening.
            includedPrimaryTypes: ['locality'],
          }
        );

        // A later keystroke may have already fired its own request —
        // ignore a stale response instead of overwriting fresher results.
        if (value !== latestQuery.current) return;

        setSuggestions(results ?? []);
        setShowSuggestions((results ?? []).length > 0);
      } catch (err) {
        console.error('Autocomplete request failed:', err);
        console.error('This usually indicates:');
        console.error('1. Billing not enabled for the Google Cloud project');
        console.error('2. Places API quota exceeded');
        console.error('3. API key lacks Places API permissions');
        console.error('4. Network or CORS issues');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setAddress(suggestion.placePrediction.text.text);
    setShowSuggestions(false);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['location'] });
      if (place.location) {
        setCoordinates({ lat: place.location.lat(), lng: place.location.lng() });
      }
    } catch (err) {
      console.error('Failed to fetch place details:', err);
    }
  };

  const getData = () => {
    const searchAddress = address;
    setAddress(''); // clear the input field

    const apiKey = import.meta.env.PUBLIC_OPENWEATHER_API_KEY;

    // get the chosen city's current weather
    fetch(
      coordinates.lat === null && coordinates.lng === null
        ? `${weatherURL}?q=${searchAddress}&APPID=${apiKey}`
        : `${weatherURL}?lat=${coordinates.lat}&lon=${coordinates.lng}&APPID=${apiKey}`
    ).then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem... STATUS CODE: ${response.status}`);
        const weatherOutput = document.getElementsByClassName('weatherOutput')[0];
        if (weatherOutput) {
          weatherOutput.innerHTML = `
          <p class="${styles.errorMsg}">Looks like there was a problem... Please try again.</p>
        `;
        }
        const forecastOutput = document.getElementById('forecastOutput');
        if (forecastOutput) forecastOutput.innerHTML = '';
        return;
      }
      response
        .json()
        .then((data) => {
          appendWeather(data);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    const appendWeather = (data: any) => {
      const icon = data.weather[0].icon;
      const date = new Date();
      const weatherOutput = document.getElementsByClassName('weatherOutput')[0];
      if (!weatherOutput) return;
      weatherOutput.innerHTML += `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p class="${styles.dateTime}">
      ${days[date.getDay()]}
      ${date.getDate()}
      ${months[date.getMonth()]}.
      ${(date.getHours() + 24) % 12 || 12}:${
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      }
      ${date.getHours() > 12 ? 'PM' : 'AM'},
      <span class="${styles.weatherConditions}">${data.weather[0].description}</span>
    </p>
    <div class="${styles.currentWeatherWrapper}">
      <div class="${styles.row1}">
        <span class="${styles.currentTemp}">${(data.main.temp - 273.15).toFixed(1)}&#8451;</span>
        <span class="weatherIcon"><img src="https://openweathermap.org/img/wn/${icon}@2x.png" /></span>
      </div>

      <div class="${styles.row2}">
        <span class="windSpeed">Wind: ${Math.round(data.wind.speed * 3.6)} Km/h</span>
        <span class="humidity">Humidity: ${data.main.humidity}%</span>
      </div>
    </div>
    `;
    };

    // get the chosen city's 5 day forecast
    fetch(
      coordinates.lat === null && coordinates.lng === null
        ? `${forecastURL}?q=${searchAddress}&APPID=${apiKey}`
        : `${forecastURL}?lat=${coordinates.lat}&lon=${coordinates.lng}&APPID=${apiKey}`
    ).then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem... STATUS CODE: ${response.status}`);
        return;
      }
      response
        .json()
        .then((forecast) => {
          appendForecast(forecast);
        })
        .catch((err) => {
          console.log(err);
        });
    });

    const appendForecast = (forecast: any) => {
      const forecastOutput = document.getElementById('forecastOutput');
      if (!forecastOutput) return;
      forecastOutput.innerHTML += `
    <h4>5 day forecast</h4>
    <div class="${styles.forecast}">`;
      for (let i = 1; i < forecast.list.length; i++) {
        const day = new Date(forecast.list[i].dt * 1000).getDay();
        const date = new Date(forecast.list[i].dt * 1000).getDate();
        if (forecast.list[i].dt_txt.includes('12:00:00')) {
          forecastOutput.innerHTML += `
      <div class="${styles.dayData}">
        <div class='${styles.day}'>
            ${shortDays[day]}
            ${date < 10 ? '0' + date : date}
          </div>
          <div class="${styles.icon}">
            <img src="https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png" />
          </div>
          <div class="${styles.temps}">${(forecast.list[i].main.temp - 273.15).toFixed(1)}&#8451;
          </div>
        </div>
      </div>
      `;
        }
      }
      forecastOutput.innerHTML += `
    <footer class="${styles.weatherFooter}">
      <div class="${styles.widgetLeftMenu__links}"><span>Powered by </span><a href="https://openweathermap.org/" target="_blank" class="${styles.widgetLeftMenu__link}">OpenWeatherMap</a></div>
    </footer>`;
    };
  };

  return (
    <div className={styles.weatherContainer}>
      <h1>
        Weather App <span className={styles.tagline}>with 5 day forecast</span>
      </h1>
      <div className={styles.searchSection}>
        <div className={styles.searchInputs}>
          <input
            value={address}
            onChange={handleInputChange}
            onClick={handleClick}
            placeholder="Enter a City ..."
            className={styles.weatherSearchInput}
            aria-label="weather-search-input"
          />
          <input className={styles.weatherGoBtn} type="submit" value="Go!" onClick={getData} />
        </div>
        {showSuggestions && (
          <div className={styles.autocompleteDropdownContainer}>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.placePrediction.placeId}
                className={styles.suggestionItem}
                style={{ backgroundColor: '#ffffff', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(51, 89, 153,0.75)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = 'initial';
                }}
                onClick={() => handleSelect(suggestion)}
              >
                <span>{suggestion.placePrediction.text.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* literal "weatherOutput" class kept alongside the module class per audit P7 */}
      <div className={`weatherOutput ${styles.weatherOutput}`} />
      <div id="forecastOutput" className={styles.forecastOutput} />
    </div>
  );
}
