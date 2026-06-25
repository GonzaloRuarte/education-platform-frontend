import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const FRONTEND_ROOT = new URL("..", import.meta.url).pathname;
const MIN_DUPLICATE_UNIT_LINES = 8;
const SOURCE_ROOTS = [join(FRONTEND_ROOT, "src"), join(FRONTEND_ROOT, "scripts")];

function readFilesRecursively(root, extensions) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return readFilesRecursively(path, extensions);
    if (entry.isFile() && extensions.some((extension) => path.endsWith(extension))) return [path];
    return [];
  });
}

function normalizedDigest(lines) {
  const normalized = lines.map((line) => line.trim().replace(/\s+/g, " ")).filter(Boolean).join("\n");
  return createHash("sha256").update(normalized).digest("hex");
}

function isCodeUnitStart(line) {
  const trimmed = line.trim();
  return /^(export\s+)?(async\s+)?function\s+\w+\s*\(/.test(trimmed) ||
    /^(export\s+)?const\s+\w+\s*=\s*(async\s*)?(\([^)]*\)|\w+)\s*=>\s*\{/.test(trimmed);
}

function duplicateCodeUnits() {
  const groups = new Map();
  for (const path of SOURCE_ROOTS.flatMap((root) => readFilesRecursively(root, [".ts", ".mjs"]))) {
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (let start = 0; start < lines.length; start += 1) {
      if (!isCodeUnitStart(lines[start])) continue;
      let depth = 0;
      let opened = false;
      for (let end = start; end < lines.length; end += 1) {
        const line = lines[end];
        depth += (line.match(/\{/g) || []).length;
        depth -= (line.match(/\}/g) || []).length;
        opened ||= line.includes("{");
        if (opened && depth <= 0 && end > start) {
          const lineCount = end - start + 1;
          if (lineCount >= MIN_DUPLICATE_UNIT_LINES) {
            const digest = normalizedDigest(lines.slice(start, end + 1));
            const locations = groups.get(digest) || [];
            locations.push(`${relative(FRONTEND_ROOT, path)}:${start + 1}:${lines[start].trim()}`);
            groups.set(digest, locations);
          }
          break;
        }
      }
    }
  }
  return Object.fromEntries([...groups.entries()].filter(([, locations]) => locations.length > 1));
}

assert.deepEqual(
  duplicateCodeUnits(),
  {},
  "Exact duplicate non-trivial frontend functions create change-propagation risk. Extract a shared helper or assign one owner.",
);

console.log("Frontend code SSOT change-propagation checks passed.");
