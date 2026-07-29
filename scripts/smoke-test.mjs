import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.output', 'public');
const routes = [
  '/', '/assets', '/campaigns', '/countries', '/design-system', '/docs/events-submission',
  '/docs/incidents-submission', '/docs/submission-safety', '/entities', '/events', '/incidents', '/submit', '/victims'
];

const contentTypes = {
  '.css': 'text/css', '.html': 'text/html', '.ico': 'image/x-icon', '.js': 'application/javascript',
  '.json': 'application/json', '.mjs': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.txt': 'text/plain', '.xml': 'application/xml', '.woff': 'font/woff', '.woff2': 'font/woff2'
};

const safeFile = async (pathname) => {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const normalized = path.posix.normalize(requested);
  const target = path.resolve(root, `.${normalized}`);
  if (!target.startsWith(`${root}${path.sep}`) && target !== root) return null;
  try {
    if ((await stat(target)).isDirectory()) return path.join(target, 'index.html');
    return target;
  } catch {
    try { return path.join(target, 'index.html'); } catch { return null; }
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const file = await safeFile(decodeURIComponent(url.pathname));
  if (!file) return res.writeHead(404).end('Not found');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': contentTypes[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await puppeteer.launch({
  headless: true,
  args: process.platform === 'linux' ? ['--no-sandbox'] : []
});

try {
  for (const route of routes) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle0' });
    if (!response?.ok()) throw new Error(`${route} returned ${response?.status()}`);
    if (!(await page.title()).trim()) throw new Error(`${route} has no document title`);
    if (!(await page.$('meta[name="description"]'))) throw new Error(`${route} has no description`);
    const unexpectedErrors = pageErrors.filter(message => !/turnstile/i.test(message));
    if (unexpectedErrors.length) throw new Error(`${route} raised page error(s): ${unexpectedErrors.join('; ')}`);
    await page.close();
  }
  for (const asset of ['/robots.txt', '/sitemap.xml', '/og-image.png']) {
    const response = await fetch(`http://127.0.0.1:${port}${asset}`);
    if (!response.ok) throw new Error(`${asset} is missing from the static output`);
  }
  console.log(`Smoke test passed for ${routes.length} routes.`);
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
