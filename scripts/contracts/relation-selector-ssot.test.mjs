import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["src", "scripts"].map((item) => join(ROOT, item));
const SUFFIXES = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const EXCLUDED_PARTS = new Set(["dist", "node_modules"]);

const GENERIC_MARKERS = [
  "/api/resources/",
  "resourceSchemaPath(",
  "resourceListPath(",
  "resourceOptionsPath(",
];

const HARDCODED_SELECTOR_PATTERNS = {
  subscription_status_paid_literal: /\bsubscription_status\b\s*(?:=|==|:)\s*["']paid["']/,
  institution_lifecycle_ready_literal: /\blifecycle_status\b\s*(?:=|==|:)\s*["']ready["']/,
  staff_assignability_active_literal: /\bassignability_status\b\s*(?:=|==|:)\s*["']active["']/,
  role_key_principal_literal: /\b(?:role_key|role__key|grant__role__key)\b\s*(?:=|==|:)\s*["']principal["']/,
  role_key_teacher_literal: /\b(?:role_key|role__key|grant__role__key)\b\s*(?:=|==|:)\s*["']teacher["']/,
};

const SPECIALIZED_SELECTOR_ENDPOINT_PATTERNS = {
  staff_selector_endpoint: /\/api\/(?!resources\/)[^"'`\s]*(?:staff|teacher|teachers)[^"'`\s]*(?:selector|options|lookup)[^"'`\s]*/,
  context_selector_endpoint: /\/api\/(?!resources\/)[^"'`\s]*(?:context)[^"'`\s]*(?:selector|options|lookup)[^"'`\s]*/,
  setup_selector_endpoint: /\/api\/setup-workbook\/[^"'`\s]*(?:selector|options|lookup)[^"'`\s]*/,
};

function* walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    const rel = relative(ROOT, fullPath).replaceAll("\\\\", "/");
    if ([...EXCLUDED_PARTS].some((part) => rel === part || rel.startsWith(`${part}/`))) continue;
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && SUFFIXES.has(extname(fullPath))) {
      yield fullPath;
    }
  }
}

const findings = [];
for (const root of SCAN_ROOTS) {
  for (const filePath of walk(root)) {
    const rel = relative(ROOT, filePath).replaceAll("\\\\", "/");
    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      for (const [code, pattern] of Object.entries(HARDCODED_SELECTOR_PATTERNS)) {
        if (pattern.test(line)) {
          findings.push({ finding_type: "hardcoded_selector_predicate", code, path: rel, line: index + 1, snippet: line.trim() });
        }
      }
      if (GENERIC_MARKERS.some((marker) => line.includes(marker))) continue;
      for (const [code, pattern] of Object.entries(SPECIALIZED_SELECTOR_ENDPOINT_PATTERNS)) {
        if (pattern.test(line)) {
          findings.push({ finding_type: "specialized_selector_endpoint", code, path: rel, line: index + 1, snippet: line.trim() });
        }
      }
    }
  }
}

assert.deepEqual(findings, [], `Frontend relation selector SSOT findings:\n${JSON.stringify(findings, null, 2)}`);

const setupWorkbookSource = readFileSync(join(ROOT, "src/resources/setupWorkbookView.ts"), "utf8");
assert.match(setupWorkbookSource, /resourceSchemaPath\(selector\.resource_alias\)/, "setup context picker should consume backend selector resource alias");
assert.match(setupWorkbookSource, /params\.filters = JSON\.stringify\(selector\.filters\)/, "setup context picker should use backend-owned manifest filters");
assert.doesNotMatch(setupWorkbookSource, /subscription_status\s*[=:]/, "setup context picker must not hardcode Organization subscription filters");
assert.doesNotMatch(setupWorkbookSource, /lifecycle_status\s*[=:]/, "setup context picker must not hardcode Institution lifecycle filters");

console.log("Relation selector SSOT frontend contract passed.");
