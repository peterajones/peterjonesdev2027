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
    <link rel="stylesheet" href="style.css" />
    <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
    <title>Pagination</title>
  </head>
  <body>
    <div style="text-align:center;">
      <input type="button" id="first" onclick="firstPage()" value="first" />
      <input type="button" id="next" onclick="nextPage()" value="next" />
      <input type="button" id="previous" onclick="previousPage()" value="previous" />
      <input type="button" id="last" onclick="lastPage()" value="last" />
      <p>Page <span id="currentPage">X</span> of <span id="numberOfPages">X</span></p>

      <div class="list">
        <ul id="list"></ul>
      </div>
    </div>
    <script src="pagination.js" type="application/javascript"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=[YOUR_API_KEY_HERE]"></script>
  </body>
</html>
`;

const jsString = `// ***NOTE*** Parts of this file have been adapted to accomodate the highlighter.
// Get the correct file on GitHub.
const url = 'https://jsonplaceholder.typicode.com/users';
var list = [];
var pageList = [];
var currentPage = 1;
var numberPerPage = 2;
var numberOfPages = 0;

function makeList() {
  async function fetchUsers(endpoint) {
    const res = await fetch(endpoint);
    let data = await res.json();

    data = data.map((user) => user);
    for (x = 0; x < data.length; x++) list.push(data[x]);
    loadList();
  }
  fetchUsers(url);
}

function getNumberOfPages() {
  return Math.ceil(list.length / numberPerPage);
}

function nextPage() {
  currentPage += 1;
  loadList();
}

function previousPage() {
  currentPage -= 1;
  loadList();
}

function firstPage() {
  currentPage = 1;
  loadList();
}

function lastPage() {
  currentPage = numberOfPages;
  loadList();
}

function loadList() {
  var begin = (currentPage - 1) * numberPerPage;
  var end = begin + numberPerPage;

  numberOfPages = getNumberOfPages();

  pageList = list.slice(begin, end);
  drawList();
  createMaps();
  check();
}

function drawList() {
  document.getElementById('currentPage').innerText = currentPage;
  document.getElementById('numberOfPages').innerText = numberOfPages;
  document.getElementById('list').innerHTML = '';
  for (var r = 0; r < pageList.length; r++) {
    document.getElementById('list').innerHTML += \`
      <li class="card">
        <div class="info">
          <p>Name: \${pageList[r].name}</p>
          <p>Email: <a href="mailto:\${pageList[r].email}">\${pageList[r].email}</a></p>
          <p>Address:</p>
          <div class="address">
            <p>\${pageList[r].address.street}</p>
            <p>\${pageList[r].address.suite}</p>
            <p>\${pageList[r].address.city}</p>
            <p>\${pageList[r].address.zipcode}</p>
          </div>
          <p>Phone: \${pageList[r].phone}</p>
          <p>Website: <a href="\${pageList[r].website}" target="_new">\${pageList[r].website}</a></p>
        </div>
        <div id="map\${pageList[r].id}" class="map"></div>
      </li>\`;
  }
}

function createMaps() {
  for (var m = 0; m < pageList.length; m++) {
    var latLng = { lat: parseFloat(pageList[m].address.geo.lat), lng: parseFloat(pageList[m].address.geo.lng) };
    var map = new google.maps.Map(document.getElementById(\`map\${pageList[m].id}\`), { zoom: 2, center: latLng });
    var marker = new google.maps.Marker({ position: latLng, map: map });
  }
}

function check() {
  document.getElementById('next').disabled = currentPage == numberOfPages ? true : false;
  document.getElementById('previous').disabled = currentPage == 1 ? true : false;
  document.getElementById('first').disabled = currentPage == 1 ? true : false;
  document.getElementById('last').disabled = currentPage == numberOfPages ? true : false;
}

function load() {
  makeList();
  loadList();
}

load();
`;

const cssString = `body {
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}
input[type='button'] {
  border: none;
  padding: 10px;
  margin-bottom: 6px;
  margin-right: 4px;
  font-size: 16px;
  background-color: darkgreen;
  color: #fff;
  border-radius: 4px;
  text-transform: capitalize;
  cursor: pointer;
}
input[type='button']:disabled {
  background-color: darkgrey;
  cursor: unset;
}
.list {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
ul#list {
  position: relative;
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-evenly;
  min-height: 50px;
}
li.card {
  display: flex;
  justify-content: center;
  text-align: left;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
}
.info {
  width: 50%;
  min-width: 240px;
}
.card p {
  line-height: 0.2;
  padding: 10px 0;
  margin: 0;
}
.address {
  padding-left: 20px;
}
.map {
  width: 260px;
  height: 220px;
  background-color: gray;
}

@media only screen and (max-width: 550px) {
  li.card {
    flex-direction: column;
  }
  .info {
    width: 100%;
    padding-bottom: 10px;
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
      <div className="code-header">pagination.js</div>
      <SyntaxHighlighter language="javascript" style={atomDark}>
        {jsString}
      </SyntaxHighlighter>
      <div className="code-header">style.css</div>
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
