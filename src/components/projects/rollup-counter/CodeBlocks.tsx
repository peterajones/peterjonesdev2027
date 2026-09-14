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
    <title>Rollup Counter</title>
    <link type="text/css" href="styles.css">
    </head>
  <body>
    <div class="container">
      <h1>Rollup Counter</h1>
      <span class="count">
        <span>0</span>
      </span>
      <div class="buttons">
        <button id="increment">Increment</button>
        <button id="reset">Reset</button>
      </div>
    </div>
    <script src="script.js"></script>
  </body>
</html>`;

const cssString = `.container {
  position: relative;
  margin: 0 auto;
  text-align: center;
  font-family: 'Open Sans', Arial, sans-serif;
}
span {
  display: inline-block;
}
span.count {
  position: relative;
  display: inline-block;
  overflow: hidden;
}
.count {
  font-size: 60px;
}
.count-enter {
  transform: translateY(100%);
  transition: 0.25s ease-in-out;
}
.count-enter.count-enter-active {
  transform: translateY(0);
}
.count-exit {
  transition: 0.25s ease-in-out;
  transform: translateY(0);
  position: absolute;
  left: 0;
  bottom: 0;
}
.count-exit.count-exit-active {
  transform: translateY(-100%);
}
.buttons {
  padding: 18px 0;
}
#increment,
#reset {
  cursor: pointer;
  font-weight: 500;
}
.comment {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  font-size: 18px;
  font-family: Arial, Helvetica, sans-serif;
}`;

const jsString = `const counter = document.querySelector('.count');
const btnIncrement = document.querySelector('#increment');
const btnReset = document.querySelector('#reset');
let count = 0;
btnIncrement.addEventListener('click', () => {
  count += 1;
  const enter = document.createElement('span');
  const exit = document.createElement('span');
  counter.replaceChild(enter, counter.children[0]);
  counter.children[0].classList.add('count-enter');
  setTimeout(() => {
    counter.children[0].classList.add('count-enter-active');
  }, 50);
  if (!counter.children[1]) {
    counter.appendChild(exit, counter.children[1]);
    counter.children[1].classList.add('count-exit');
    setTimeout(() => {
      counter.children[1].classList.add('count-exit-active');
    }, 50);
  } else {
    counter.replaceChild(exit, counter.children[1]);
    counter.children[1].classList.add('count-exit');
    setTimeout(() => {
      counter.children[1].classList.add('count-exit-active');
    }, 50);
  }
  enter.innerHTML = count;
  exit.innerHTML = count - 1;
  setTimeout(() => {
    counter.children[0].classList.remove('count-enter', 'count-enter-active');
    counter.removeChild(counter.children[1]);
  }, 500);
});
btnReset.addEventListener('click', () => {
  count = 0;
  counter.innerHTML = \`<span>{count}</span>\`;
});`;

export default function CodeBlocks({ open, onToggle }: Props) {
  return (
    <section className={open ? 'code is-open' : 'code is-closed'}>
      <p className="red-msg">
        The code displayed below is from my original iteration in HTML, CSS and JS.
      </p>
      <div className="code-header">index.html</div>
      <SyntaxHighlighter language="html" style={atomDark}>
        {htmlString}
      </SyntaxHighlighter>
      <div className="code-header">style.css</div>
      <SyntaxHighlighter language="css" style={atomDark}>
        {cssString}
      </SyntaxHighlighter>
      <div className="code-header">script.js</div>
      <SyntaxHighlighter language="javascript" style={atomDark}>
        {jsString}
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
