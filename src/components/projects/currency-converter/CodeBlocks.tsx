import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Props {
  open: boolean;
  onToggle: () => void;
}

const htmlString = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla Currency Converter</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"
    integrity="sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="css/style.css">
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Currency Converter</h1>
    </div>
    <div class="date"></div>
    <div class="fetch-error"></div>
    <ul class="currencies"></ul>
    <button class="add-currency-btn"><i class="fas fa-long-arrow-alt-left"></i>Add Currency</button>
    <ul class="add-currency-list"></ul>
  </div>
  <script src="js/config.js"></script>
  <script src="js/main.js"></script>
</body>

</html>`;

const jsString = `const API_KEY = config.API_KEY;
const BASE_URL = config.BASE_URL;
const DATA_URL = \`\${BASE_URL}\${API_KEY}\`;

const addCurrencyBtn = document.querySelector('.add-currency-btn');
const addCurrencyList = document.querySelector('.add-currency-list');
const currenciesList = document.querySelector('.currencies');
const fetchError = document.querySelectorAll('.fetch-error');

const initiallyDisplayedCurrencies = ["CAD", "USD", "EUR", "JPY"];
let baseCurrency;
let baseCurrencyAmount;

let currencies = [
  { name: "US Dollar", abbreviation: "USD", symbol: "$", flagURL: "./img/flags/us.svg" },
  { name: "Euro", abbreviation: "EUR", symbol: "€", flagURL: "./img/flags/eu.svg" },
  { name: "Japanese Yen", abbreviation: "JPY", symbol: "¥", flagURL: "./img/flags/jp.svg" },
  // ...remaining currencies omitted for brevity
];

// Event Listeners

addCurrencyBtn.addEventListener('click', addCurrencyBtnClick);

function addCurrencyBtnClick(event) {
  addCurrencyBtn.classList.toggle("open");
}

addCurrencyList.addEventListener('click', addCurrencyListClick);

function addCurrencyListClick(event) {
  const clickedListItem = event.target.closest('li');
  if (!clickedListItem.classList.contains('disabled')) {
    const newCurrency = currencies.find(c => c.abbreviation === clickedListItem.getAttribute('data-currency'));
    if (newCurrency) newCurrenciesListItem(newCurrency);
    addCurrencyBtn.classList.toggle("open");
  }
}

currenciesList.addEventListener('click', currenciesListClick);

function currenciesListClick(event) {
  if (event.target.classList.contains("close")) {
    const parentNode = event.target.parentNode;
    parentNode.remove();
    addCurrencyList.querySelector(\`[data-currency=\${parentNode.id}]\`).classList.remove('disabled');
    if (parentNode.classList.contains('base-currency')) {
      const newBaseCurrencyLI = currenciesList.querySelector('.currency');
      if (newBaseCurrencyLI) {
        setNewBaseCurrency(newBaseCurrencyLI);
        baseCurrencyAmount = Number(newBaseCurrencyLI.querySelector('.input input').value);
      }
    }
  }
}

function setNewBaseCurrency(newBaseCurrencyLI) {
  newBaseCurrencyLI.classList.add('base-currency');
  baseCurrency = newBaseCurrencyLI.id;
  baseCurrencyRate = currencies.find(c => c.abbreviation === baseCurrency).rate;
  currenciesList.querySelectorAll('.currency').forEach(currencyLI => {
    const currencyRate = currencies.find(currency => currency.abbreviation === currencyLI.id).rate;
    const exchangeRate = currencyLI.id === baseCurrency ? 1 : (currencyRate / baseCurrencyRate).toFixed(4);
    currencyLI.querySelector('.base-currency-rate').textContent = \`1 \${baseCurrency} = \${exchangeRate} \${currencyLI.id}\`;
  });
}

currenciesList.addEventListener('input', currenciesListInputChange);

function currenciesListInputChange(event) {
  const isNewBaseCurrency = event.target.closest('li').id !== baseCurrency;
  if (isNewBaseCurrency) {
    currenciesList.querySelector(\`#\${baseCurrency}\`).classList.remove('base-currency');
    setNewBaseCurrency(event.target.closest('li'));
  }
  const newBaseCurrencyAmount = isNaN(event.target.value) ? 0 : Number(event.target.value);
  if (baseCurrencyAmount !== newBaseCurrencyAmount || isNewBaseCurrency) {
    baseCurrencyAmount = newBaseCurrencyAmount;
    const baseCurrencyRate = currencies.find(c => c.abbreviation === baseCurrency).rate;
    currenciesList.querySelectorAll('.currency').forEach(currencyLI => {
      if (currencyLI.id !== baseCurrency) {
        const currencyRate = currencies.find(currency => currency.abbreviation === currencyLI.id).rate;
        const exchangeRate = currencyLI.id === baseCurrency ? 1 : (currencyRate / baseCurrencyRate).toFixed(4);
        currencyLI.querySelector('.input input').value = exchangeRate * baseCurrencyAmount !== 0 ? (exchangeRate * baseCurrencyAmount).toFixed(4) : '';
      }
    });
  }
}

currenciesList.addEventListener('focusout', currenciesListFocusOut);

function currenciesListFocusOut(event) {
  const inputValue = event.target.value;
  if (isNaN(inputValue) || Number(inputValue) === 0) event.target.value = "";
  else event.target.value = Number(inputValue).toFixed(4);
}

currenciesList.addEventListener('keydown', currenciesListKeyDown);

function currenciesListKeyDown(event) {
  if (event.key === 'Enter') event.target.blur();
}

// Functions

function populateAddCurrencyList() {
  for (let i = 0; i < currencies.length; i++) {
    addCurrencyList.insertAdjacentHTML(
      "beforeend",
      \`<li data-currency=\${currencies[i].abbreviation}>
        <img src=\${currencies[i].flagURL} alt="flag" class="flag">
        <span>\${currencies[i].abbreviation} - \${currencies[i].name}</span>
      </li>\`
    );
  }
}

function populateCurrenciesList() {
  for (let i = 0; i < initiallyDisplayedCurrencies.length; i++) {
    const currency = currencies.find(c => c.abbreviation === initiallyDisplayedCurrencies[i]);
    if (currency) newCurrenciesListItem(currency);
  }
}

function newCurrenciesListItem(currency) {
  if (currenciesList.childElementCount === 0) {
    baseCurrency = currency.abbreviation;
    baseCurrencyAmount = 0;
  }
  addCurrencyList.querySelector(\`[data-currency=\${currency.abbreviation}\`).classList.add('disabled');
  const baseCurrencyRate = currencies.find(c => c.abbreviation === baseCurrency).rate;
  const exchangeRate = currency.abbreviation === baseCurrency ? 1 : (currency.rate / baseCurrencyRate).toFixed(4);
  const inputValue = baseCurrencyAmount ? (baseCurrencyAmount * exchangeRate).toFixed(4) : "";

  currenciesList.insertAdjacentHTML(
    "beforeend",
    \`<li class="currency \${currency.abbreviation === baseCurrency ? "base-currency" : ""}" id=\${currency.abbreviation}>
      <img src=\${currency.flagURL} class="flag">
      <div class="info">
        <p class="input"><span class="currency-symbol">\${currency.symbol}</span><input placeholder="0.0000" value=\${inputValue}></p>
        <p class="currency-name">\${currency.abbreviation} - \${currency.name}</p>
        <p class="base-currency-rate">1 \${baseCurrency} = \${exchangeRate} \${currency.abbreviation}</p>
      </div>
      <span class="close">&times;</span>
    </li>\`
  );
}

fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    document.querySelector('.date').textContent = data.date;
    data.rates['EUR'] = 1;
    currencies = currencies.filter(currency => data.rates[currency.abbreviation]);
    currencies.forEach(currency => currency.rate = data.rates[currency.abbreviation]);
    populateAddCurrencyList();
    populateCurrenciesList();
  })
  .then(data => data.error.message ? fetchError.insertAdjacentHTML(data.error.message) : "")
  .catch(err => console.log(err));
`;

const cssString = `@import url('https://fonts.googleapis.com/css?family=Montserrat');
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  font-family: 'Montserrat', sans-serif;
  background-color: #505562;
  color: #ffffff;
}

.container {
  position: relative;
  width: 500px;
  margin: 20px auto;
  overflow-x: hidden;
  user-select: none;
}

.header {
  background-color: #2d2d37;
  text-align: center;
  padding: 1.75rem;
}

.header h1 {
  font-size: 2.25rem;
}

.date {
  background-color: #222;
  text-align: right;
  font-size: 0.75rem;
  padding: 0.75rem 2rem 0.75rem 0;
}

ul.currencies {
  height: calc(100vh - 40px - 100px - 40px - 58px);
  background-color: #222;
  padding: 0 1.5rem 1rem 1.5rem;
  overflow-y: auto;
}

ul.currencies li {
  background-color: #2d2d37;
  border-radius: 5px;
  list-style: none;
  padding: 1rem 1rem 0.75rem 1rem;
  margin-bottom: 1rem;
  position: relative;
}

ul.currencies li:last-child {
  margin-bottom: 0;
}

ul.currencies li.base-currency {
  background-color: #264d73;
}

img.flag {
  width: 60px;
  height: 40px;
  vertical-align: top;
}

.info {
  display: inline-block;
  width: 78%;
}

.info .input span {
  font-size: 1.5rem;
  display: inline-block;
  width: 4rem;
  text-align: center;
}

.info .input input {
  font-size: 1.5rem;
  width: 78%;
  background-color: transparent;
  border: 2px solid #fff;
  border-radius: 5px;
  color: #fff;
  padding: 0.3rem;
  margin-bottom: 0.75rem;
}

.info .currency-name {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  margin-left: 4rem;
}

.info .base-currency-rate {
  font-size: 0.8rem;
  margin-left: 4rem;
}

ul.currencies li .close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 0.5rem;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: color 0.25s ease-in-out;
}

ul.currencies li .close:hover {
  color: #fff;
}

ul.currencies::-webkit-scrollbar {
  width: 5px;
}

ul.currencies::-webkit-scrollbar-thumb {
  background-color: #2d2d37;
  border-bottom: 1rem solid #222;
}

ul.add-currency-list {
  position: absolute;
  bottom: 54px;
  left: 105%;
  background-color: #f1f1f1;
  color:#333;
  width: 100%;
  height: calc(100vh - 40px - 100px - 55px);
  overflow-y: auto;
  transition: all 0.25s ease-in-out;
}

ul.add-currency-list li {
  list-style: none;
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

ul.add-currency-list li.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

ul.add-currency-list li .flag {
  width: 3rem;
  height: 2rem;
  vertical-align: middle;
}

ul.add-currency-list li span {
  margin-left: 1rem;
  font-weight: bold;
}

.add-currency-btn {
  position: relative;
  background-color: #00b386;
  color: #fff;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-top: 3px solid #222;
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.25s ease-in-out;
}

.add-currency-btn i {
  position: absolute;
  top: 0.75rem;
  left: 30%;
  font-size: 2rem;
  opacity: 0;
  transition: all .25s ease-in-out;
}

.add-currency-btn.open {
  background-color: #d9534f;
}

.add-currency-btn.open i {
  opacity: 1;
  left: 1.25rem;
}

.add-currency-btn.open + ul.add-currency-list {
  left: 0;
}

.add-currency-btn.open + ul.add-currency-list li:hover {
  background-color: #ddd;
}

@media (max-width: 600px) {
  html {
    font-size: 14px;
  }
  .container {
    width: 100%;
    margin: 0 auto;
  }
  ul.currencies {
    height: calc(100vh - 83px - 34px - 51px);
  }
  .header h1 {
    font-size: 2rem;
  }
  .flag {
    width: 3rem;
    height: 2rem;
  }
  .info .input span {
    font-size: 1.25rem;
    width: 3.5rem
  }
  .info .input input {
    font-size: 1.25rem;
    width: 76%;
  }
  .info .currency-name {
    margin-left: 3.5rem;
  }
  .info .base-currency-rate {
    margin-left: 3.5rem;
  }
  ul.add-currency-list {
    bottom: 48px;
    height: calc(100vh - 80px - 51px);
  }
  .add-currency-btn i {
    left: 25%;
    top: 0.65rem;
  }
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
      <div className="code-header">js/main.js</div>
      <SyntaxHighlighter language="javascript" style={atomDark}>
        {jsString}
      </SyntaxHighlighter>
      <div className="code-header">css/style.css</div>
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
