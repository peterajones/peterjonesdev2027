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
    <title>Password Generator</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <h2>Random<br />Password Generator</h2>
      <div class="result-container">
        <span id="result"></span>
      </div>
      <div id="msg"></div>
      <div class="settings">
        <div class="setting">
          <label>Password length</label>
          <input type="range" min="1" max="20" value="20" id="length" /><span id="length_disp"></span>
        </div>
        <div class="setting">
          <label>
            Include uppercase letters
            <input type="checkbox" id="uppercase" checked onchange="handleUpperChange()" />
          </label>
        </div>
        <div class="setting">
          <label>
            Include lowercase letters
            <input type="checkbox" id="lowercase" checked onchange="handleLowerChange()" />
          </label>
        </div>
        <div class="setting">
          <label>
          Include numbers
            <input type="checkbox" id="numbers" checked onchange="handleNumbersChange()" />
          </label>
        </div>
        <div class="setting">
          <label>
          Include symbols
            <input type="checkbox" id="symbols" checked onchange="handleSymbolsChange()" />
          </label>
        </div>
      </div>
      <button class="btn btn-large" id="generate">
        Generate password
      </button>
      <button class="btn" id="clipboard" title="Copy to clipboard...">
        <i class="far fa-clipboard"></i>
      </button>
    </div>
    <script src="main.js"></script>
  </body>
</html>`;

const jsString = `// DOM elements
const resultElement = document.getElementById('result');
const clipboardElement = document.getElementById('clipboard');
const lengthElement = document.getElementById('length_disp');
const uppercaseElement = document.getElementById('uppercase');
const lowercaseElement = document.getElementById('lowercase');
const numbersElement = document.getElementById('numbers');
const symbolsElement = document.getElementById('symbols');
const generateElement = document.getElementById('generate');

const randomFunc = {
  upper: getRandomUpper,
  lower: getRandomLower,
  number: getRandomNumber,
  symbol: getRandomSymbol
};

generateElement.addEventListener('click', () => {
  const length = parseInt(lengthElement.innerHTML);
  const hasUpper = uppercaseElement.checked;
  const hasLower = lowercaseElement.checked;
  const hasNumbers = numbersElement.checked;
  const hasSymbols = symbolsElement.checked;

  resultElement.innerText = generatePassword(length, hasUpper, hasLower, hasNumbers, hasSymbols);
});

function handleUpperChange() {
  let id = document.getElementById('uppercase');
  if (id.parentElement.classList.contains('line-through')) {
    id.parentElement.classList.remove('line-through');
  } else {
    id.parentElement.classList.add('line-through');
  }
}

function handleLowerChange() {
  let id = document.getElementById('lowercase');
  if (id.parentElement.classList.contains('line-through')) {
    id.parentElement.classList.remove('line-through');
  } else {
    id.parentElement.classList.add('line-through');
  }
}

function handleNumbersChange() {
  let id = document.getElementById('numbers');
  if (id.parentElement.classList.contains('line-through')) {
    id.parentElement.classList.remove('line-through');
  } else {
    id.parentElement.classList.add('line-through');
  }
}

function handleSymbolsChange() {
  let id = document.getElementById('symbols');
  if (id.parentElement.classList.contains('line-through')) {
    id.parentElement.classList.remove('line-through');
  } else {
    id.parentElement.classList.add('line-through');
  }
}

// Length slider
const lengthSlider = document.getElementById('length');
let output = document.getElementById('length_disp');
output.innerHTML = lengthSlider.value;
lengthSlider.oninput = function() {
  output.innerHTML = this.value;
};

// Copy password to clipboard
clipboardElement.addEventListener('click', () => {
  const textarea = document.createElement('textarea');
  const password = resultElement.innerText;
  const msg = document.getElementById('msg');

  if (!password) {
    return;
  }

  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  msg.classList.add('fade-out');
  msg.innerText = 'Copied!';
  setTimeout(() => {
    msg.classList.remove('fade-out');
    msg.innerText = '';
  }, 2000);
});

// Generate password function
function generatePassword(length, upper, lower, number, symbol) {
  // 1. Init pw var
  let generatedPassword = '';
  // 2. filter out unchecked types
  const typesCount = upper + lower + number + symbol;
  const typesArr = [{ upper }, { lower }, { number }, { symbol }].filter((item) => Object.values(item)[0]);
  if (typesCount === 0) {
    return '';
  }
  // 3. loop over the length call generator function for each type
  for (let i = 0; i < length; i += typesCount) {
    typesArr.forEach((type) => {
      const funcName = Object.keys(type)[0];
      generatedPassword += randomFunc[funcName]();
    });
  }
  // 4. Add generated pw to the pw var and return
  const finalPassword = generatedPassword.slice(0, length);
  return finalPassword;
}

// Generator functions - https://ascii.cl/htmlcodes.htm
function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!@#$%^&*()<>+?={}[],.£';
  return symbols[Math.floor(Math.random() * symbols.length)];
}
`;

const cssString = `@import url('https://fonts.googleapis.com/css?family=Muli&display=swap');

* {
  box-sizing: border-box;
}

body {
  background-color: #f6f6f6;
  color: #fff;
  display: flex;
  font-family: 'Muli', sans-serif;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  min-height: 100vh;
}

p {
  margin: 5px 0;
}

h2 {
  margin: 10px 0 20px;
  text-align: center;
}

input[type='checkbox'] {
  margin-right: 0;
}

.container {
  background-color: #663399;
  box-shadow: 0px 2px 10px rgba(255, 255, 255, 0.2);
  padding: 20px;
  width: 350px;
  max-width: 100%;
}

.result-container {
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  font-size: 18px;
  letter-spacing: 1px;
  padding: 12px 10px;
  height: 50px;
  width: 100%;
}

.result-container #result {
  word-wrap: break-word;
  max-width: calc(100% - 40px);
}

.result-container .btn {
  font-size: 20px;
  position: absolute;
  top: 5px;
  right: 5px;
  height: 40px;
  width: 40px;
}

.btn {
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 12px;
  background-color: #0656df;
  transition: background-color 0.35s ease-in-out;
}

button#generate.btn:hover,
button#clipboard.btn:hover,
button#generate.btn:focus,
button#clipboard.btn:focus {
  background-color: #df0606;
  outline: none;
}

.btn-large {
  display: block;
  width: 100%;
}

button#clipboard {
  position: relative;
  top: -280px;
  left: 262px;
  height: 42px;
  width: 44px;
}

input#length:focus,
input[type='checkbox']:focus {
  outline: 5px solid #ff0000;
  outline-style: double;
}

div#msg {
  text-align: center;
  color: #ffffff;
  height: 10px;
  transition: all 2.8s ease-in-out;
}

div#msg.fade-out {
  color: transparent;
  text-shadow: 1px 1px 2px transparent, -1px -1px 2px transparent;
}

.setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

label {
  width: 100%;
  display: contents;
}

label.line-through {
  text-decoration: line-through;
}

span#length_disp {
  width: 20px;
  text-align: right;
}

@media screen and (max-width: 400px) {
  .result-container {
    font-size: 14px;
  }
}`;

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
      <div className="code-header">main.js</div>
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
