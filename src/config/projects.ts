export type Badge = 'HTML' | 'CSS' | 'JS' | 'REACT' | 'NODE';

export interface ProjectEntry {
  slug: string;
  title: string;
  intro: string[];
  badges: Badge[];
  image: string;
  imageAlt: string;
}

const badgeSrc: Record<Badge, string> = {
  HTML: '/images/code/badge-HTML.png',
  CSS: '/images/code/badge-CSS.png',
  JS: '/images/code/badge-JS.png',
  REACT: '/images/code/badge-REACT.png',
  NODE: '/images/code/badge-Nodejs.png',
};

export function badgeImage(badge: Badge): string {
  return badgeSrc[badge];
}

export const projects: ProjectEntry[] = [
  {
    slug: 'currency-converter',
    title: 'Currency Converter',
    intro: ['A handy currency converter'],
    badges: ['HTML', 'CSS', 'JS', 'NODE'],
    image: '/images/code/currency-converter.jpg',
    imageAlt: 'Currency Converter',
  },
  {
    slug: 'weather-app',
    title: 'Weather App',
    intro: ['A Weather App with a 5 day forecast.'],
    badges: ['HTML', 'CSS', 'JS'],
    image: '/images/code/weather-app.jpeg',
    imageAlt: 'Weather App',
  },
  {
    slug: 'random-password-generator',
    title: 'Random Password Generator',
    intro: [
      'A random password generator in JavaScript.',
      'You set the length of the password that you want to generate and then select the characters you want in the password.',
    ],
    badges: ['REACT', 'JS'],
    image: '/images/code/password-generator.jpeg',
    imageAlt: 'Random Password Generator',
  },
  {
    slug: 'pagination',
    title: 'Pagination',
    intro: [
      'A fun project fetching data from an API, adding Google Maps and paginating the results.',
      'Lots going on in this one!',
    ],
    badges: ['REACT', 'JS'],
    image: '/images/code/pagination.jpg',
    imageAlt: 'Pagination',
  },
  {
    slug: 'checkbox-styling',
    title: 'CSS - Checkbox Styling',
    intro: [
      'Checkboxes can be used for a number of purposes but who wants to look at the way the browser renders them?',
      'Here I explore one way that traditional checkboxes can be styled to look the same in all browsers.',
      'Click on this tile to see more...',
    ],
    badges: ['HTML', 'CSS'],
    image: '/images/code/checkbox-styling.jpg',
    imageAlt: 'Checkbox Styling',
  },
  {
    slug: 'pizza-pie',
    title: 'Pizza Pie',
    intro: [
      'This was a prototype for an idea for a client who wanted to graphically show how many orders or visits were left until a free pizza was available.',
      'Click on this tile to see more...',
    ],
    badges: ['HTML', 'CSS', 'JS'],
    image: '/images/code/pizza-pie.jpg',
    imageAlt: 'Pizza Pie',
  },
  {
    slug: 'rollup-counter',
    title: 'Javascript Rollup Counter',
    intro: [
      "This is a vanilla Javascript version of a react-transition-group animation that I saw on one of Wes Bos' tutorials.",
      'As the counter increments, the numbers roll up to reveal the increment.',
    ],
    badges: ['CSS', 'JS'],
    image: '/images/code/rollup-counter.jpg',
    imageAlt: 'Rollup Counter',
  },
  {
    slug: 'js-clock',
    title: 'React Twelve Hour Clock',
    intro: [
      'Here is a simple clock that generates the current time using a new JavaScript Date object.',
      'Click on this tile to see more...',
    ],
    badges: ['JS'],
    image: '/images/code/react-clock-code.jpg',
    imageAlt: 'Template',
  },
];
