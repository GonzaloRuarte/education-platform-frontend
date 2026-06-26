import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const FRONTEND_ROOT = new URL("../..", import.meta.url).pathname;
const MIN_DUPLICATE_UNIT_LINES = 8;
const SOURCE_ROOTS = [join(FRONTEND_ROOT, "src"), join(FRONTEND_ROOT, "scripts")];
const TEXT_SUFFIXES = [".ts", ".mjs", ".md", ".json", ".html", ".css"];

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

function staleLifecycleMarkers() {
  const forbidden = ["leg" + "acy", "depre" + "cated", "quaran" + "tine", "obso" + "lete", "br" + "idge"];
  const versionPattern = /\bv1\d{2}\b|\bV1\d{2}\b|as of v\d+/;
  const violations = {};
  for (const path of SOURCE_ROOTS.flatMap((root) => readFilesRecursively(root, TEXT_SUFFIXES)).concat([join(FRONTEND_ROOT, "README.md")])) {
    const text = readFileSync(path, "utf8");
    const lowered = text.toLowerCase();
    for (const marker of forbidden) {
      if (lowered.includes(marker)) {
        violations[marker] ||= [];
        violations[marker].push(relative(FRONTEND_ROOT, path));
      }
    }
    if (versionPattern.test(text)) {
      violations.versionedHistoryMarker ||= [];
      violations.versionedHistoryMarker.push(relative(FRONTEND_ROOT, path));
    }
  }
  return violations;
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

assert.deepEqual(
  staleLifecycleMarkers(),
  {},
  "Historical cleanup labels, version-pass markers, and transition placeholder terminology must not re-enter living frontend code/docs.",
);

console.log("Frontend code SSOT change-propagation checks passed.");
