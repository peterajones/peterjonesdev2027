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
  <title>Checkboxes to Switches</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<div id="container">
  <br>
  <h1>Converting checkboxes to switches</h1>
  <form action="GET" id="form1">
    <h4>Here are some conventional checkboxes</h4>
      <label><input name="email" type="checkbox">Newsletter</label>
      <label><input name="notifications" type="checkbox" checked>Notifications</label>
      <label><input name="alerts" type="checkbox">Email Alerts</label>
  </form>
  <br>
  <form action="GET" id="form2">
    <h4>Here are the converted checkboxes</h4>
    <div id="switches">
      <label for="email">
        <input type="checkbox" name="email" id="email">
        <span>Newsletter</span>
      </label>
      <label for="notifications">
        <input type="checkbox" checked name="notifications" id="notifications">
        <span>Notifications</span>
      </label>
      <label for="alerts">
        <input type="checkbox" name="alerts" id="alerts">
        <span>Email Alerts</span>
      </label>
    </div>
  </form>
  <br>
</div>
</body>
</html>`;

const cssString = `@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
body {
  color: #fff;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 16px;
  background: #ffffff;
}
h4 {
  font-size: 24px;
}
#container {
  position: relative;
  width: 920px;
  height: 100%;
  margin: 0 auto;
  text-align: center;
  background-color: #747474;
  border: 1px solid rgba(0, 200, 0, 0.6);
}
#switches {
  position: relative;
  margin-left: calc(50% - 50px);
  text-align: left;
}
label {
  display: block;
  margin: 0 0 20px 0;
  cursor: pointer;
}
input {
  position: absolute;
  left: 400px;
}
label span {
  display: inline-block;
  width: 45px;
  height: 24px;
  position: relative;
  top: 8px;
  right: 8px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  transition: background-color 0.3s;
}
label span::after {
  content: '';
  display: block;
  position: absolute;
  top: 4px;
  left: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: left 0.3s;
}
label input:checked + span {
  border-color: #fff;
  background-color: rgb(0, 200, 0);
}
label input:checked + span::after {
  left: calc(100% - 21px);
  background-color: #fff;
}
#form2 label input {
  display: none;
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
