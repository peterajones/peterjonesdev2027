import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Props {
  open: boolean;
  onToggle: () => void;
}

const htmlString = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Pizza Pie Revealed</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Eat some pizza!</h1>
        <p id="how_many">How many slices do you want?</p>
        <select id="ddl" onchange="myFunction(this)">
          <option value="0" id="0">Choose your slices</option>
          <option value="1" id="1">One</option>
          <option value="2" id="2">Two</option>
          <option value="3" id="3">Three</option>
          <option value="4" id="4">Four</option>
          <option value="5" id="5">Five</option>
          <option value="6" id="6">Six</option>
          <option value="7" id="7">Seven</option>
          <option value="8" id="8">Eight</option>
        </select>
      </div>
      <div class="piechart">
        <div class="common border"></div>
        <div class="common base"></div>
        <div class="common slice slice_1_c">
          <div class="common slice slice_1_w" id="slice_0_w"></div>
        </div>
        <div class="common slice slice_2_c">
          <div class="common slice slice_2_w" id="slice_1_w"></div>
        </div>
        <div class="common slice slice_3_c">
          <div class="common slice slice_3_w" id="slice_2_w"></div>
        </div>
        <div class="common slice slice_4_c">
          <div class="common slice slice_4_w" id="slice_3_w"></div>
        </div>
        <div class="common slice slice_5_c">
          <div class="common slice slice_5_w" id="slice_4_w"></div>
        </div>
        <div class="common slice slice_6_c">
          <div class="common slice slice_6_w" id="slice_5_w"></div>
        </div>
        <div class="common slice slice_7_c">
          <div class="common slice slice_7_w" id="slice_6_w"></div>
        </div>
        <div class="common slice slice_8_c">
          <div class="common slice slice_8_w" id="slice_7_w"></div>
        </div>
      </div>
      <div id="eaten" style="font-family: Arial, sans-serif; font-size: 24px; margin-top: 124px;"></div>
    </div>
    <script src="main.js"></script>
  </body>
</html>
`;

const cssString = `/* vendor prefixes have been removed - remember those days? */
body {
  background-color: #f98611;
}
.container {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
.header {
  margin-top: 50px;
  margin-bottom: -90px;
  font-family: Arial, sans-serif;
  font-size: 24px;
}
.piechart {
  margin: 0 auto;
  position: relative;
  height: 300px;
  width: 300px;
  top: 100px;
}
.common {
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: 50%;
}
.border {
  border: 1px solid #000;
  top: -1px;
  left: -1px;
  width: 301px;
  height: 301px;
}
.base {
  background: #000 url(uncut_pizza.png) no-repeat 0 0;
}
.slice {
  clip: rect(0px, 150px, 300px, 0);
  border-color: #ff0000;
  border-style: solid;
  border-width: 0 1px 0 0;
}
.slice_1_c {
  transform: rotate(180deg);
}
.slice_1_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(226deg);
}
.slice_2_c {
  transform: rotate(226deg);
}
.slice_2_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(224deg);
}
.slice_3_c {
  transform: rotate(270deg);
}
.slice_3_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(224deg);
}
.slice_4_c {
  transform: rotate(314deg);
}
.slice_4_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(226deg);
}
.slice_5_c {
  transform: rotate(360deg);
}
.slice_5_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(226deg);
}
.slice_6_c {
  transform: rotate(-314deg);
}
.slice_6_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(224deg);
}
.slice_7_c {
  transform: rotate(-270deg);
}
.slice_7_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(224deg);
}
.slice_8_c {
  transform: rotate(-226deg);
}
.slice_8_w {
  background-color: rgba(255, 255, 255, 1);
  transform: rotate(226deg);
}
#eaten {
  font-family: Arial, sans-serif;
  font-size: 24px;
  padding-top: 20px;
}
`;

const jsString = `function myFunction(val) {
  var x = val.value;
  var slice_num = ['0', '1', '2', '3', '4', '5', '6', '7'];
  var num_slices = slice_num.length;
  var y = num_slices - x;

  for (var i = 0; i < x; i++) {
    var slice_ = 'slice_' + slice_num[i] + '_w';
    document.getElementById(slice_).style.opacity = '0';
    document.getElementById(slice_).style.transition = 'all 2.5s ease-in 0s';
    document.getElementById(i).setAttribute('disabled', 'disabled');
  }

  if (i == 0) {
    document.getElementById('eaten').innerHTML = 'Come on dude... go on, eat a slice!';
  } else if (i == 1) {
    document.getElementById('eaten').innerHTML = 'You have eaten ' + i + ' slice. (Eat some more...)';
    document.getElementById('how_many').innerHTML = 'More?';
  } else if (i >= 2 && i <= 3) {
    document.getElementById('eaten').innerHTML = 'You have eaten ' + i + ' slices. (Keep eating...)';
    document.getElementById('how_many').innerHTML = 'More?';
  } else if (i == 4) {
    document.getElementById('eaten').innerHTML = 'You have eaten ' + i + " slices. (You're halfway there...)";
    document.getElementById('how_many').innerHTML = 'More?';
  } else if (i >= 5 && i <= 6) {
    document.getElementById('eaten').innerHTML = 'You have eaten ' + i + ' slices. (Keep eating...)';
    document.getElementById('how_many').innerHTML = 'More?';
  } else if (i == 7) {
    document.getElementById('eaten').innerHTML = 'You have eaten ' + i + ' slices. (Only one more slice to go...)';
    document.getElementById('how_many').innerHTML = 'Go on, have the last one...';
  } else {
    document.getElementById('eaten').innerHTML =
      'Now order another one...<br/><input type="button" value="Start Over" onClick="document.location.reload(true)">';
    document.getElementById('how_many').innerHTML = 'Dude, you have eaten the whole pizza!';
  }
}
`;

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
      <div className="code-header">styles.css</div>
      <SyntaxHighlighter language="css" style={atomDark}>
        {cssString}
      </SyntaxHighlighter>
      <div className="code-header">main.js</div>
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
