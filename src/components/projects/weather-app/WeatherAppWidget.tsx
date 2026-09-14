import { useState } from 'react';
import WeatherApp from './WeatherApp';
import CodeBlocks from './CodeBlocks';

export default function WeatherAppWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <p>
        Get the current weather for a city of your choice. Includes a 5 day forecast.{' '}
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <br />
      <div className="stage">
        <WeatherApp />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>This weather app with 5 day forecast uses 2 APIs:</p>
          <ol className="weatherOl">
            <li>
              The{' '}
              <a href="https://developers.google.com/places/web-service/intro?hl=en_US" target="_new">
                Google Places API
              </a>{' '}
              which is used to autofill the city input field. Start typing and the API will
              give you a selection of cities from which to choose.
            </li>
            <li>
              The weather data comes from the{' '}
              <a href="https://openweathermap.org/api" target="_new">
                OpenWeather API
              </a>
              .
            </li>
          </ol>
          <p>
            Both of these APIs are free to use with the usual requirement that you need to
            sign up and get an API key and there are some restrictions as to the number of
            calls to the API per day, but for a small app like this one it is not an issue.
          </p>
          <h4>How does this work?</h4>
          <p>
            The Google Places API is pretty easy to set up and use. You should be careful to
            add options (i.e. cities only) to restrict the amount of data being returned and
            therefore reducing the risk of being billed for data that you are not using. You
            will note that after selecting one of Google's suggestions, you can tab to the
            submit button and press enter to retrieve the data - the input field is cleared
            for a new search and the weather data appears.
          </p>
          <p>
            The OpenWeather API that I'm using provides for fetching current weather data
            for the selected city as well as a 5 day / 3 hour forecast. The current weather
            part is straight forward, however, the forecast data returns an array of 40
            items (1 every 3 hours (8 per day) * 5 days). This is way too much data for this
            simple interface, so I needed to find a way to limit the data to one of those
            forecast items per day.
          </p>
          <p>
            What I chose to do was use the forecast data for noon of each day - this will
            give a sort of average temperature for each day. Good enough for a forecast
            overview.
          </p>
          <p>
            The icons are part of the data set. The temperatures are returned in Kelvin
            units. There is an option to add <code className="inline">units=imperial</code>{' '}
            or <code className="inline">units=metric</code> to the query string but I opted
            to do an inline conversion to Celcius. A similar conversion was done for the wind
            speed.
          </p>
          <p>
            The footer link is part of the design of some of the widgets which can be seen
            on the{' '}
            <a href="https://openweathermap.org/widgets-constructor" target="_new">
              OpenWeather website
            </a>
            . It's not obligatory to add this; I just wanted to show my appreciation.
          </p>
          <p>
            Clicking on the 'Go!' button if the input field is empty will remove any
            returned data and show an error message.
          </p>
          <p>
            When a new search is initiated by clicking or tapping in the input field, the
            current search result is removed.
          </p>
          <p>
            It's also possible to add all sorts of enhancements. For example, given the
            current temperature and weather conditions, you could add a custom message: Temp
            &gt; 0&#8451; and rain you could add a custom message 'Go get your umbrella!' or
            Temp &lt; 0&#8451; and snow, message: 'Looks like winter is here. Don't slip on
            the ice!'.
          </p>
          <p>Have fun!</p>

          <a
            href="https://github.com/peterajones/weather-forecast-app"
            target="_new"
            className="github-link"
          >
            <span>Get it on GitHub</span>
            <span className="github-getit">
              <div className="github-logo" />
            </span>
          </a>
          <span className="btn-widget-code">
            <button onClick={() => setCodeOpen((v) => !v)}>
              {codeOpen ? 'Hide the code' : 'Show me the code'}
            </button>
          </span>
        </div>
      </div>
      <CodeBlocks open={codeOpen} onToggle={() => setCodeOpen((v) => !v)} />
    </>
  );
}
