import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { feeds } from '../../src/config/news';

export interface VisualRoute {
  name: string;
  path: string;
  mask?: string[];
}

const blogDir = fileURLToPath(new URL('../../src/content/blog/', import.meta.url));

const blogPosts: VisualRoute[] = readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !/^draft:\s*true\s*$/m.test(readFileSync(blogDir + f, 'utf8')))
  .map((f) => f.replace(/\.md$/, ''))
  .map((slug) => ({ name: `blog-${slug}`, path: `/blog/${slug}` }));

const projects = [
  'checkbox-styling',
  'currency-converter',
  'js-clock',
  'pagination',
  'pizza-pie',
  'random-password-generator',
  'rollup-counter',
  'weather-app',
];

const masks: Record<string, string[]> = {
  'project-pagination': ['.map'],
};

export const routes: VisualRoute[] = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  ...blogPosts,
  { name: 'projects', path: '/projects' },
  ...projects.map((p) => ({ name: `project-${p}`, path: `/projects/${p}` })),
  { name: 'news', path: '/news' },
  ...feeds.map((f) => ({ name: `news-${f.slug}`, path: `/news/${f.slug}` })),
  { name: 'contact', path: '/contact' },
].map((r) => ({ ...r, mask: masks[r.name] }));
