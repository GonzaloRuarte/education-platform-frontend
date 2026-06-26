import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : path;
    }),
  );
  return files.flat();
}

const files = await listFiles('dist/assets');
const jsFiles = files.filter((file) => file.endsWith('.js'));
if (jsFiles.length === 0) {
  throw new Error('No compiled JavaScript files found in dist/assets.');
}

const app = await readFile('dist/assets/app.js', 'utf8');
const forbiddenFragments = [
  '/users',
  '/appointments',
  '/question-bank',
  'manage_institutions',
  'manage_admin_users',
  'manage_groupings',
];
const matches = forbiddenFragments.filter((fragment) => app.includes(fragment));
if (matches.length > 0) {
  throw new Error(`Compiled app contains removed fragments: ${matches.join(', ')}`);
}

const extensionlessRelativeImports = [];
const importPattern = /(?:from\s+|import\s*\(\s*)["'](\.{1,2}\/[^"']+)["']/g;
for (const jsFile of jsFiles) {
  const source = await readFile(jsFile, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier && extname(specifier) === '') {
      extensionlessRelativeImports.push(`${jsFile}: ${specifier}`);
    }
  }
}

if (extensionlessRelativeImports.length > 0) {
  throw new Error(
    `Compiled JavaScript contains extensionless relative module imports that fail in browsers/nginx:\n${extensionlessRelativeImports.join('\n')}`,
  );
}
