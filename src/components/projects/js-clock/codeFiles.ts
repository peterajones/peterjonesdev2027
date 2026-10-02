import type { CodeFile } from '../CodeBlocks';

// The original HTML/CSS/JS iteration of the js-clock demo, shown in its
// "Show me the code" panel.

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

export const codeFiles: CodeFile[] = [
  { name: 'index.html', language: 'html', code: htmlString },
  { name: 'script.js', language: 'javascript', code: jsString },
  { name: 'styles.css', language: 'css', code: cssString },
];
