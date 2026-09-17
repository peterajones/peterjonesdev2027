import { useState } from 'react';
import CurrencyConverter from './CurrencyConverter';
import CodeBlocks from './CodeBlocks';

export default function CurrencyConverterWidget() {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <p style={{ paddingBottom: '30px' }}>
        A handy currency converter. Build your own lists of currencies to compare several
        currencies at the same time!{' '}
        <span className="btn-widget-description">
          <button onClick={() => setDescriptionOpen((v) => !v)}>
            {descriptionOpen ? 'Hide description' : 'Read more...'}
          </button>
        </span>
      </p>
      <div className="stage">
        <CurrencyConverter />
      </div>
      <div className="code-content">
        <div className={descriptionOpen ? 'code-description-open' : 'code-description-closed'}>
          <br />
          <p>This currency converter uses the Exchange Rates API to provide real-time currency conversion:</p>
          <ul>
            <li>
              The{' '}
              <a href="https://exchangeratesapi.io/" target="_new">
                Exchange Rates API
              </a>{' '}
              provides up-to-date exchange rates for 30+ currencies with daily updates.
            </li>
          </ul>
          <p>
            The Exchange Rates API is free to use with the usual requirement that you need
            to sign up and get an API key. There are some restrictions on the number of
            calls per day, but for a small app like this one it is not an issue.
          </p>
          <h4>How does this work?</h4>
          <p>
            The currency converter allows you to build your own custom list of currencies
            to compare. You can add and remove currencies from your list, and the app will
            remember your preferences using localStorage. When you enter an amount in any
            currency, it automatically calculates the equivalent amounts in all other
            currencies in your list.
          </p>
          <p>
            The app features a dynamic base currency system - whichever currency you type
            an amount into becomes the new base currency, and all other amounts update
            automatically based on the current exchange rates.
          </p>
          <p>
            Exchange rates are updated daily and fetched directly from the Exchange Rates
            API. The app displays the current date of the exchange rates so you know how
            fresh the data is.
          </p>
          <p>
            Currency amounts are formatted with proper localization and you can easily
            reset all amounts or clear your entire currency list using the control buttons.
          </p>
          <p>
            The &quot;Add Currency&quot; button slides out a full list of available
            currencies with country flags for easy identification. Selected currencies are
            disabled to prevent duplicates in your conversion list.
          </p>
          <p>
            The app includes 30+ major world currencies and uses localStorage to persist
            your currency selection between sessions, so your preferred currencies are
            remembered when you return.
          </p>
          <p>Have fun!</p>

          <a
            href="https://github.com/peterajones/vanilla-currency-converter"
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
