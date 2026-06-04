import { readFile, readdir } from 'node:fs/promises';

const files = await readdir('dist/assets');
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
  throw new Error(`Compiled app contains legacy fragments: ${matches.join(', ')}`);
}
