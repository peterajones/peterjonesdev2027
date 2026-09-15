// "Latest Updates" changelog shown in the navbar bell modal.
// Add a new entry to the top of this array whenever you ship something worth noting.
//
// Full history ported from the live peterjones.dev (2026 Next.js) site's
// Components/UpdatesList.js, back to the June 2019 launch. `details` may
// contain simple inline HTML (e.g. `<a href="...">`) — it's rendered with
// set:html in Navbar.astro, safe here since this is fully author-controlled
// static content, never user input. A few old entries linked to pages that
// don't exist in this rebuild (a standalone Todo List project, the old
// /code/* URL structure) — those links were dropped, kept as plain text;
// others were remapped to their current /projects/* equivalent.
export interface UpdateEntry {
  date: string; // e.g. "September 14 2027"
  details: string;
}

export const updates: UpdateEntry[] = [
  {
    date: 'September 14 2027',
    details:
      "Rebuilt the site on Astro, replacing Next.js. Static by default, React only where a page is actually interactive, and the contact form no longer needs a Netlify-specific workaround.",
  },
  {
    date: 'January 9 2026',
    details:
      "I decided to update the site to use the latest NextJS 15 features, including the new app directory structure and server components. This should improve performance and maintainability. Also, I added a new code snippet for a 'Dark Mode Toggle' component that can be easily integrated into any React project. Enjoy!",
  },
  {
    date: 'June 12 2022',
    details:
      "It's been a while! This site has been rebuilt with NextJS. It went live back in January 2022 but there were quite a few things that needed fixing and I haven't had much time to work on this. This morning I added a fix for the syntax highlighting in the code blocks. It turns out that NextJS needs a little help for Prism to work correctly.",
  },
  {
    date: 'December 28 2023',
    details:
      'Finally got around to fixing the <a href="/news">News</a> RSS feeds. It turns out the signature of the feeds had changed. Not a difficult fix, but a bit time consuming. Who does that anyway?',
  },
  {
    date: 'June 12 2022',
    details:
      "It's been a while! This site has been rebuilt with NextJS. It went live back in January 2022 but there were quite a few things that needed fixing and I haven't had much time to work on this. This morning I added a fix for the syntax highlighting in the code blocks. It turns out that NextJS needs a little help for Prism to work correctly.",
  },
  {
    date: 'September 9 2020',
    details:
      'Replaced the NEWSApi feeds with RSS feeds. The first feed comes from <a href="/news/cbc-world-news">CBC - World News</a>. The NEWSApi was fun to work with but the production version of this website required an expensive license, so the alternative was to use freely available RSS feeds which of course meant rewriting the NEWS section.',
  },
  {
    date: 'December 3 2019',
    details:
      "The <a href=\"/projects\">Code Snippet's pages</a> were looking a little long and I wanted to bring the focus to the stage area where the widget lives. I added a 'Read More...' button to show/hide the detailed description. When the detailed description is showing, there is another button to 'Show me the code'. Less clutter is better I think.",
  },
  {
    date: 'November 29 2019',
    details: 'Added an new code snippets widget: <a href="/projects/weather-app">Weather App</a>',
  },
  {
    date: 'November 23 2019',
    details:
      'The unnecessary footer was removed. The "latest updates" where moved to the top nav. On mobile, the icons were replaced with text descriptions. A background color for the modal was added.',
  },
  {
    date: 'November 18 2019',
    details:
      'The top nav item "Code" now maintains active state when navigating to individual snippets pages.',
  },
  {
    date: 'November 10 2019',
    details:
      "Refactored the <a href=\"/projects/pizza-pie\">Pizza Pie</a> project. The pie now has 8 slices (not 10) and 'Starting Over' no longer causes a full page refresh.",
  },
  {
    date: 'November 7 2019',
    details:
      "Added this modal to keep track of what is new here - and when it was added. These notes come from the repos' commits file.",
  },
  {
    date: 'November 6 2019',
    details:
      'Converted the site to React hooks where possible. This is a big refactoring project but results in a more readable and maintainable codebase.',
  },
  {
    date: 'November 3 2019',
    details: 'Added Google Site Tag to index.html - time to get onboard with Google Analytics for this site!',
  },
  {
    date: 'October 31 2019',
    details: 'Added the <a href="/projects/random-password-generator">Random Password Generator</a> to the Code section.',
  },
  {
    date: 'October 18 2019',
    details:
      'This site is now a PWA (Progessive Web App). Check it out on your mobile device and add it to your homescreen!',
  },
  {
    date: 'October 16 2019',
    details:
      'Dark mode has been added! Click on the sun (or moon) icon in the top navigation menu - enjoy! Your settings are saved to localStorage.',
  },
  {
    date: 'September 7 2019',
    details: 'Tweaks to the Todo List styling for Safari on iOS.',
  },
  {
    date: 'September 3 2019',
    details: "Added a FontAwesome icon for the delete button on the Todo List - the CSS wasn't cutting it!",
  },
  {
    date: 'September 2 2019',
    details:
      'Added react-helmet as a dependency to add unique titles to the pages. Hover over the tab in your desktop browser to check it out. Another insightful recommendation from the Lighthouse audit tool in Chrome.',
  },
  {
    date: 'August 30 2019',
    details:
      'Added the <a href="/projects/pagination">Pagination Project</a> (complete with Google Maps) to the Code Snippets page.',
  },
  {
    date: 'August 4 2019',
    details:
      'Added a zoom-out effect on scroll to the hero images (section landing pages) and tweaked some accessibility colour contrasts.',
  },
  {
    date: 'July 23 2019',
    details: "Added a colour changer for the list title and counter for the Apple styled Todo List.",
  },
  {
    date: 'July 18 2019',
    details: 'Added code badges to the cards on the <a href="/projects">Code Snippets</a> page.',
  },
  {
    date: 'June 26 2019',
    details: 'Fixes to the mobile nav menu for iPad(Pro).',
  },
  {
    date: 'June 24 2019',
    details: 'Resolved issues with the Netlify <a href="/contact">Contact Form</a>.',
  },
  {
    date: 'June 24 2019',
    details: 'Initial commit!!!',
  },
];
