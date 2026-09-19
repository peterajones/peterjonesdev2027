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
  <title>Digital Clock</title>
  <link type="text/css" href="styles.css">
</head>
<body>
  <div class="center">
    <h1>The time is: <span id="clock"></span></h1>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

const jsString = `function displayTime() {
  var currTime = new Date();
  var hrs = currTime.getHours();
  var mins = currTime.getMinutes();
  var secs = currTime.getSeconds();
  // 12 hour clock
  var meridiem = "AM";
  if (hrs > 12) {
      hrs = hrs - 12;
      meridiem = "PM";
  }
  if (hrs === 0) {
      hrs = 12;
  }
  if (hrs < 10) {
      hrs = "0" + hrs;
  }
  if (mins < 10) {
      mins = "0" + mins;
  }
  if (secs < 10) {
      secs = "0" + secs;
  }
  var clock = document.getElementById('clock');
  clock.innerText = hrs + ":" + mins + ":" + secs +  " " + meridiem;
  setInterval(displayTime, 1000);
}
displayTime();`;

const cssString = `.center {
  top: 50%;
  left: 40%;
  position: fixed;
}
h1 {
  font-family: Arial, sans-serif;
}`;

export default function CodeBlocks({ open, onToggle }: Props) {
  return (
    <section className={open ? 'code is-open' : 'code is-closed'}>
      <p>
        The code displayed below is from my original iteration in HTML, CSS and JS.
      </p>
      <div className="code-header">index.html</div>
      <SyntaxHighlighter language="html" className=" html" style={atomDark}>
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
