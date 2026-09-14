// "Latest Updates" changelog shown in the navbar bell modal.
// Add a new entry to the top of this array whenever you ship something worth noting.
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
      "Updated the site to use the latest Next.js 15 features, including the new app directory structure and server components.",
  },
];
