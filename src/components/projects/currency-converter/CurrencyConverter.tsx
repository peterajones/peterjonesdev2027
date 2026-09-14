import { useEffect, useState } from 'react';

interface Currency {
  name: string;
  abbreviation: string;
  symbol: string;
  flagURL: string;
}

const currencyData: Currency[] = [
  { name: 'US Dollar', abbreviation: 'USD', symbol: '$', flagURL: '/images/flags/us.svg' },
  { name: 'Euro', abbreviation: 'EUR', symbol: '€', flagURL: '/images/flags/eu.svg' },
  { name: 'Japanese Yen', abbreviation: 'JPY', symbol: '¥', flagURL: '/images/flags/jp.svg' },
  { name: 'British Pound', abbreviation: 'GBP', symbol: '£', flagURL: '/images/flags/gb.svg' },
  { name: 'Australian Dollar', abbreviation: 'AUD', symbol: '$', flagURL: '/images/flags/au.svg' },
  { name: 'Canadian Dollar', abbreviation: 'CAD', symbol: '$', flagURL: '/images/flags/ca.svg' },
  { name: 'Swiss Franc', abbreviation: 'CHF', symbol: 'CHF', flagURL: '/images/flags/ch.svg' },
  { name: 'Chinese Yuan Renminbi', abbreviation: 'CNY', symbol: '¥', flagURL: '/images/flags/cn.svg' },
  { name: 'Swedish Krona', abbreviation: 'SEK', symbol: 'kr', flagURL: '/images/flags/se.svg' },
  { name: 'New Zealand Dollar', abbreviation: 'NZD', symbol: '$', flagURL: '/images/flags/nz.svg' },
  { name: 'Mexican Peso', abbreviation: 'MXN', symbol: '$', flagURL: '/images/flags/mx.svg' },
  { name: 'Singapore Dollar', abbreviation: 'SGD', symbol: '$', flagURL: '/images/flags/sg.svg' },
  { name: 'Hong Kong Dollar', abbreviation: 'HKD', symbol: '$', flagURL: '/images/flags/hk.svg' },
  { name: 'Norwegian Krone', abbreviation: 'NOK', symbol: 'kr', flagURL: '/images/flags/no.svg' },
  { name: 'South Korean Won', abbreviation: 'KRW', symbol: '₩', flagURL: '/images/flags/kr.svg' },
  { name: 'Turkish Lira', abbreviation: 'TRY', symbol: '₺', flagURL: '/images/flags/tr.svg' },
  { name: 'Russian Ruble', abbreviation: 'RUB', symbol: '₽', flagURL: '/images/flags/ru.svg' },
  { name: 'Indian Rupee', abbreviation: 'INR', symbol: '₹', flagURL: '/images/flags/in.svg' },
  { name: 'Brazilian Real', abbreviation: 'BRL', symbol: 'R$', flagURL: '/images/flags/br.svg' },
  { name: 'South African Rand', abbreviation: 'ZAR', symbol: 'R', flagURL: '/images/flags/za.svg' },
  { name: 'Philippine Peso', abbreviation: 'PHP', symbol: '₱', flagURL: '/images/flags/ph.svg' },
  { name: 'Czech Koruna', abbreviation: 'CZK', symbol: 'Kč', flagURL: '/images/flags/cz.svg' },
  { name: 'Indonesian Rupiah', abbreviation: 'IDR', symbol: 'Rp', flagURL: '/images/flags/id.svg' },
  { name: 'Malaysian Ringgit', abbreviation: 'MYR', symbol: 'RM', flagURL: '/images/flags/my.svg' },
  { name: 'Hungarian Forint', abbreviation: 'HUF', symbol: 'Ft', flagURL: '/images/flags/hu.svg' },
  { name: 'Icelandic Krona', abbreviation: 'ISK', symbol: 'kr', flagURL: '/images/flags/is.svg' },
  { name: 'Croatian Kuna', abbreviation: 'HRK', symbol: 'kn', flagURL: '/images/flags/hr.svg' },
  { name: 'Bulgarian Lev', abbreviation: 'BGN', symbol: 'лв', flagURL: '/images/flags/bg.svg' },
  { name: 'Romanian Leu', abbreviation: 'RON', symbol: 'lei', flagURL: '/images/flags/ro.svg' },
  { name: 'Danish Krone', abbreviation: 'DKK', symbol: 'kr', flagURL: '/images/flags/dk.svg' },
  { name: 'Thai Baht', abbreviation: 'THB', symbol: '฿', flagURL: '/images/flags/th.svg' },
  { name: 'Polish Zloty', abbreviation: 'PLN', symbol: 'zł', flagURL: '/images/flags/pl.svg' },
  { name: 'Israeli Shekel', abbreviation: 'ILS', symbol: '₪', flagURL: '/images/flags/il.svg' },
];

const DEMO_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  CAD: 1.45,
  JPY: 155.3,
  GBP: 0.85,
  AUD: 1.6,
  CHF: 0.95,
  CNY: 7.85,
  SEK: 11.2,
  NZD: 1.65,
};

function formatAmount(amount: number) {
  if (!amount) return '';
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CurrencyConverter() {
  const [mounted, setMounted] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [baseCurrency, setBaseCurrency] = useState('');
  const [baseCurrencyAmount, setBaseCurrencyAmount] = useState(0);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [dateText, setDateText] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);

    const storedCurrencies = localStorage.getItem('selectedCurrencies');
    const defaults = ['CAD', 'USD', 'EUR', 'JPY'];
    const initialCurrencies: string[] = storedCurrencies ? JSON.parse(storedCurrencies) : defaults;

    const cachedRates = localStorage.getItem('exchangeRates');
    if (cachedRates) {
      try {
        const { rates, timestamp, date } = JSON.parse(cachedRates);
        const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
        const isStale = Date.now() - timestamp > CACHE_DURATION;

        if (!isStale && rates) {
          setExchangeRates(rates);
          setDateText(date);
        } else {
          localStorage.removeItem('exchangeRates');
          setDateText('Enter amount and press Enter to get live rates');
        }
      } catch {
        localStorage.removeItem('exchangeRates');
        setDateText('Enter amount and press Enter to get live rates');
      }
    } else {
      setDateText('Enter amount and press Enter to get live rates');
    }

    setSelectedCurrencies(initialCurrencies);
    if (initialCurrencies.length > 0) {
      setBaseCurrency(initialCurrencies[0]);
    }
  }, []);

  const handleAddCurrency = (currencyAbbr: string) => {
    if (!selectedCurrencies.includes(currencyAbbr)) {
      const newSelected = [...selectedCurrencies, currencyAbbr];
      setSelectedCurrencies(newSelected);
      localStorage.setItem('selectedCurrencies', JSON.stringify(newSelected));

      if (selectedCurrencies.length === 0) {
        setBaseCurrency(currencyAbbr);
        setBaseCurrencyAmount(0);
      }
    }
    setAddCurrencyOpen(false);
  };

  const handleRemoveCurrency = (currencyAbbr: string) => {
    const newSelected = selectedCurrencies.filter((c) => c !== currencyAbbr);
    setSelectedCurrencies(newSelected);
    localStorage.setItem('selectedCurrencies', JSON.stringify(newSelected));

    if (baseCurrency === currencyAbbr && newSelected.length > 0) {
      setBaseCurrency(newSelected[0]);
    }
  };

  const handleAmountChange = (currencyAbbr: string, amount: string) => {
    setInputValues((prev) => ({ ...prev, [currencyAbbr]: amount }));

    const numAmount = isNaN(Number(amount)) ? 0 : Number(amount);

    if (currencyAbbr !== baseCurrency) {
      setBaseCurrency(currencyAbbr);
      setInputValues({ [currencyAbbr]: amount });
    }
    setBaseCurrencyAmount(numAmount);
  };

  const getDemoRates = () => DEMO_RATES;

  const fetchExchangeRates = async () => {
    try {
      const apiKey = import.meta.env.PUBLIC_EXCHANGE_RATES_API_KEY;
      const response = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}`);
      const data = await response.json();

      if (data.success) {
        setDateText(data.date);
        data.rates['EUR'] = 1;
        setExchangeRates(data.rates);

        const cacheData = { rates: data.rates, timestamp: Date.now(), date: data.date };
        localStorage.setItem('exchangeRates', JSON.stringify(cacheData));
      } else {
        console.error('API returned error:', data.error);
        setDateText('API Rate Limited - Using Demo Rates');
        setExchangeRates(getDemoRates());
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setDateText('API Error - Using Demo Rates');
      setExchangeRates(getDemoRates());
    }
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>, amount: string) => {
    if (event.key === 'Enter') {
      const numAmount = isNaN(Number(amount)) ? 0 : Number(amount);
      if (numAmount > 0) {
        await fetchExchangeRates();
      }
    }
  };

  const resetAmounts = () => {
    setBaseCurrencyAmount(0);
    setInputValues({});
  };

  const clearCurrencies = () => {
    setSelectedCurrencies([]);
    setBaseCurrency('');
    setBaseCurrencyAmount(0);
    setInputValues({});
    localStorage.setItem('selectedCurrencies', JSON.stringify([]));
  };

  const getExchangeRate = (fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return 1;
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    return toRate / fromRate;
  };

  if (!mounted) {
    return (
      <div className="cc">
        <div className="currency-container">
          <h1>Loading Currency Converter...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="cc">
      <div className="currency-container">
        <div className="currency-header">
          <h1>Currency Converter</h1>
        </div>
        <div className="currency-date">
          <span className={`currency-date-text ${dateText.includes('Enter amount') ? 'enter-prompt' : ''}`}>
            {dateText}
          </span>
          <a href="https://exchangeratesapi.io/" target="_blank" rel="noopener noreferrer">
            <img
              src="/images/code/exchangeratesapi_white_logo.svg"
              alt="Powered by exchangeratesapi.io"
              width={153}
              height={20}
              className="api-logo"
            />
          </a>
        </div>
        <div className="currency-fetch-error" />
        <ul className="currency-list">
          {selectedCurrencies.map((currencyAbbr) => {
            const currency = currencyData.find((c) => c.abbreviation === currencyAbbr);
            if (!currency) return null;

            const isBase = currencyAbbr === baseCurrency;
            const exchangeRate = getExchangeRate(baseCurrency, currencyAbbr);
            const displayAmount = isBase ? baseCurrencyAmount : baseCurrencyAmount * exchangeRate;
            const inputValue =
              inputValues[currencyAbbr] !== undefined ? inputValues[currencyAbbr] : formatAmount(displayAmount);

            return (
              <li key={currencyAbbr} className={`currency-item ${isBase ? 'currency-base' : ''}`} id={currencyAbbr}>
                <img src={currency.flagURL} alt="flag" className="currency-flag" width={60} height={40} />
                <div className="currency-info">
                  <p className="currency-input">
                    <span className="currency-symbol">{currency.symbol}</span>
                    <input
                      id="currency-input"
                      name="currency-name"
                      placeholder=""
                      value={inputValue}
                      onChange={(e) => handleAmountChange(currencyAbbr, e.target.value.replace(/,/g, ''))}
                      onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value.replace(/,/g, ''))}
                      onFocus={() => {
                        if (inputValues[currencyAbbr] === undefined) {
                          const focusValue = displayAmount === 0 ? '' : displayAmount.toString();
                          setInputValues((prev) => ({ ...prev, [currencyAbbr]: focusValue }));
                        }
                      }}
                      onBlur={() => {
                        setInputValues((prev) => {
                          const newValues = { ...prev };
                          delete newValues[currencyAbbr];
                          return newValues;
                        });
                      }}
                    />
                  </p>
                  <p className="currency-name">
                    {currencyAbbr} - {currency.name}
                  </p>
                  <p className="currency-rate">
                    1 {baseCurrency} ={' '}
                    {exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{' '}
                    {currencyAbbr}
                  </p>
                </div>
                <span className="currency-close" onClick={() => handleRemoveCurrency(currencyAbbr)}>
                  &times;
                </span>
              </li>
            );
          })}
        </ul>
        <div className="currency-controls">
          <button className="currency-reset-btn" onClick={resetAmounts}>
            Reset Amounts
          </button>
          <button className="currency-clear-btn" onClick={clearCurrencies}>
            Clear Currencies
          </button>
        </div>
        <button
          className={`currency-add-btn ${addCurrencyOpen ? 'open' : ''}`}
          onClick={() => setAddCurrencyOpen((v) => !v)}
        >
          <svg
            className="arrow-left-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {addCurrencyOpen ? 'Back' : 'Add Currency'}
        </button>
        <ul className="currency-add-list">
          {currencyData.map((currency) => (
            <li
              key={currency.abbreviation}
              data-currency={currency.abbreviation}
              className={selectedCurrencies.includes(currency.abbreviation) ? 'disabled' : ''}
              onClick={() => !selectedCurrencies.includes(currency.abbreviation) && handleAddCurrency(currency.abbreviation)}
            >
              <img src={currency.flagURL} alt="flag" className="currency-flag" width={48} height={32} />
              <span>
                {currency.abbreviation} - {currency.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
