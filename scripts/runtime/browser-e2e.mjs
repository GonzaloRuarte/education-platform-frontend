import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { assertLoadedE2eRuntimeContract } from "../contracts/e2e-runtime-contract.mjs";
import { buildBrowserPageObjects } from "./browser-page-objects.mjs";
import { assertLoadedE2ePayloadContract, materializeE2ePayloadArtifactPlans } from "../contracts/e2e-payload-contract.mjs";
import { assertFullCoverageE2eContract } from "../contracts/full-coverage-e2e-contract.mjs";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "../contracts/backend-contract-policy.mjs";
const contract = assertLoadedE2eRuntimeContract();
const pageObjects = buildBrowserPageObjects();
const payloadContract = assertLoadedE2ePayloadContract();
const fullCoverageE2eContract = assertFullCoverageE2eContract();
const runEnabled = process.env.RETROBOLT_RUN_BROWSER_E2E === "1";

const requiredEnv = [
  "RETROBOLT_FRONTEND_BASE_URL",
  "RETROBOLT_API_BASE_URL",
  "RETROBOLT_ADMIN_USERNAME",
  "RETROBOLT_ADMIN_PASSWORD",
  "RETROBOLT_E2E_ARTIFACT_DIR",
];

const forbiddenSupportControlFragments = Object.freeze([
  "support_self_service",
  "accessibility_self_service",
  "student_self_service",
  "secondary_support_unlock",
]);

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing browser E2E environment variable: ${name}`);
  }
  return value.trim();
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    throw new Error(
      "Browser E2E runtime requires Playwright in the provisioned frontend environment. " +
      "Install it there with npm install --save-dev playwright and install browser binaries before running RETROBOLT_RUN_BROWSER_E2E=1 npm run test:e2e:browser. " +
      `Original import error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function waitVisible(page, selector, label) {
  await page.locator(selector).waitFor({ state: "visible", timeout: 30_000 });
  assert.ok(await page.locator(selector).count(), `${label} should be visible`);
}

function htmlIncludes(html, fragment) {
  return String(html || "").includes(fragment);
}

async function clickAndWaitVisible(page, clickSelector, visibleSelector, label) {
  await page.locator(clickSelector).click();
  await waitVisible(page, visibleSelector, label);
}

async function assertSupportControlsSelfService(page) {
  const html = await page.content();
  for (const fragment of forbiddenSupportControlFragments) {
    assert.equal(html.includes(fragment), false, `browser E2E page must not expose unsupported support-control fragment ${fragment}`);
  }
}

async function writeJsonArtifact(artifactDir, filename, payload) {
  const path = join(artifactDir, filename);
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
}


const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const SETUP_WORKBOOK_FIRST_DATA_ROW = 4;

const institutionSetupWorkbookSheets = Object.freeze([
  {
    key: "enrollment_periods",
    title: "01 Institution Years",
    columns: [
      { key: "enrollment_period_key", label: "Institution year key", required: true },
      { key: "name", label: "Name", required: true },
      { key: "starts_on", label: "Starts on", required: true },
      { key: "ends_on", label: "Ends on", required: true },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "period_grades",
    title: "02 Grade Offerings",
    columns: [
      { key: "grade_offering_key", label: "Grade offering key", required: true },
      { key: "enrollment_period_key", label: "Institution year key", required: true },
      { key: "grade", label: "Grade", required: true },
      { key: "name", label: "Name" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "division_subject_offerings",
    title: "03 Grade Subject Scopes",
    columns: [
      { key: "scope_key", label: "Scope key", required: true },
      { key: "grade_offering_key", label: "Grade offering key", required: true },
      { key: "subject_key", label: "Subject key", required: true },
      { key: "name", label: "Name" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "divisions",
    title: "04 Divisions",
    columns: [
      { key: "division_key", label: "Division key", required: true },
      { key: "scope_key", label: "Scope key", required: true },
      { key: "name", label: "Name", required: true },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "users",
    title: "05 Staff and Teachers",
    columns: [
      { key: "user_key", label: "User key", required: true },
      { key: "username", label: "Username", required: true },
      { key: "first_name", label: "First name" },
      { key: "last_name", label: "Last name" },
      { key: "email", label: "Email" },
      { key: "account_setup_state", label: "Account setup state", required: true },
      { key: "assignability_status", label: "Assignability status", required: true },
    ],
  },
  {
    key: "students",
    title: "06 Students",
    columns: [
      { key: "student_key", label: "Student key", required: true },
      { key: "personal_id", label: "Personal ID", required: true },
    ],
  },
  {
    key: "student_rollover",
    title: "07 Student Rollover",
    columns: [
      { key: "rollover_key", label: "Rollover key", required: true },
      { key: "student_key", label: "Student key", required: true },
      { key: "outcome", label: "Outcome", required: true },
      { key: "target_scope_key", label: "Target scope key" },
      { key: "target_division_key", label: "Target division key" },
      { key: "effective_on", label: "Effective on" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    key: "enrollments",
    title: "08 Enrollments",
    columns: [
      { key: "enrollment_key", label: "Enrollment key", required: true },
      { key: "student_key", label: "Student key", required: true },
      { key: "scope_key", label: "Scope key", required: true },
      { key: "division_key", label: "Division key", required: true },
      { key: "valid_from", label: "Valid from" },
      { key: "valid_to", label: "Valid to" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "role_grants",
    title: "09 Staff Role Assignments",
    columns: [
      { key: "assignment_key", label: "Assignment key", required: true },
      { key: "user_key", label: "User key", required: true },
      { key: "role_key", label: "Role key", required: true },
      { key: "enrollment_period_key", label: "Institution year key" },
      { key: "status", label: "Status" },
      { key: "starts_on", label: "Starts on" },
      { key: "ends_on", label: "Ends on" },
      { key: "grant_reason", label: "Grant reason" },
    ],
  },
  {
    key: "role_grant_scopes",
    title: "10 Role Grant Scopes",
    columns: [
      { key: "role_scope_key", label: "Role scope key", required: true },
      { key: "assignment_key", label: "Assignment key", required: true },
      { key: "scope_key", label: "Scope key", required: true },
      { key: "division_key", label: "Division key", required: true },
    ],
  },
]);

const SETUP_WORKBOOK_ASSIGNABILITY_ACTIVE = "active";
const SETUP_WORKBOOK_TEACHER_ROLE_KEY = "teacher";

function buildInstitutionSetupRows(prefix) {
  return {
    enrollment_periods: [{
      enrollment_period_key: `${prefix}_2032`,
      name: `${prefix} 2032`,
      starts_on: "2032-03-01",
      ends_on: "2032-12-20",
      active: "true",
    }],
    period_grades: [{
      grade_offering_key: `${prefix}_g5`,
      enrollment_period_key: `${prefix}_2032`,
      grade: "5",
      name: "5º browser proof",
      active: "true",
    }],
    division_subject_offerings: [{
      scope_key: `${prefix}_g5_pdl`,
      grade_offering_key: `${prefix}_g5`,
      subject_key: "alpha_pdl_subject",
      name: "5º PDL browser proof",
      active: "true",
    }],
    divisions: [{
      division_key: `${prefix}_g5_pdl_a`,
      scope_key: `${prefix}_g5_pdl`,
      name: "Browser Proof A",
      active: "true",
    }],
    users: [{
      user_key: `${prefix}_teacher`,
      username: `${prefix}_teacher`,
      first_name: "Browser",
      last_name: "Proof Teacher",
      email: `${prefix}-teacher@alpha.example.invalid`,
      account_setup_state: "password_not_setup",
      assignability_status: SETUP_WORKBOOK_ASSIGNABILITY_ACTIVE,
    }],
    students: [{
      student_key: `${prefix}_student`,
      personal_id: "BROWSER001",
    }],
    student_rollover: [],
    enrollments: [{
      enrollment_key: `${prefix}_student_g5_pdl_a`,
      student_key: `${prefix}_student`,
      scope_key: `${prefix}_g5_pdl`,
      division_key: `${prefix}_g5_pdl_a`,
      valid_from: "2032-03-01",
      valid_to: "",
      active: "true",
    }],
    role_grants: [{
      assignment_key: `${prefix}_teacher_assignment`,
      user_key: `${prefix}_teacher`,
      role_key: SETUP_WORKBOOK_TEACHER_ROLE_KEY,
      enrollment_period_key: `${prefix}_2032`,
      status: "active",
      starts_on: "2032-03-01",
      ends_on: "",
      grant_reason: "Setup Workbook browser E2E proof",
    }],
    role_grant_scopes: [{
      role_scope_key: `${prefix}_teacher_scope`,
      assignment_key: `${prefix}_teacher_assignment`,
      scope_key: `${prefix}_g5_pdl`,
      division_key: `${prefix}_g5_pdl_a`,
    }],
  };
}

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function columnName(index) {
  let n = index;
  let name = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function worksheetXml(sheet, rowsBySheet) {
  const rows = [];
  const headerValues = sheet.columns.map((column) => `${column.label}${column.required ? " *" : ""}`);
  rows.push({ index: 1, values: headerValues });
  rows.push({ index: 2, values: [] });
  rows.push({ index: 3, values: [] });
  const dataRows = rowsBySheet[sheet.key] || [];
  for (const [offset, row] of dataRows.entries()) {
    rows.push({ index: SETUP_WORKBOOK_FIRST_DATA_ROW + offset, values: sheet.columns.map((column) => row[column.key] ?? "") });
  }
  const xmlRows = rows.map((row) => {
    const cells = row.values.map((value, columnIndex) => {
      const ref = `${columnName(columnIndex + 1)}${row.index}`;
      if (value === "" || value === null || value === undefined) {
        return `<c r="${ref}"/>`;
      }
      return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
    }).join("");
    return `<row r="${row.index}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetData>${xmlRows}</sheetData></worksheet>`;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const dosTime = 0;
  const dosDate = 0x21;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }
  const centralDir = Buffer.concat(centralParts);
  const local = Buffer.concat(localParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(local.length, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([local, centralDir, eocd]);
}

function workbookXml(sheets) {
  const sheetNodes = sheets.map((sheet, index) => `<sheet name="${xmlEscape(sheet.title)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetNodes}</sheets></workbook>`;
}

function workbookRelsXml(sheets) {
  const rels = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function contentTypesXml(sheets) {
  const sheetOverrides = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetOverrides}</Types>`;
}

function buildInstitutionSetupWorkbookXlsx(prefix) {
  const rowsBySheet = buildInstitutionSetupRows(prefix);
  const sheets = institutionSetupWorkbookSheets;
  return zipStore([
    { name: "[Content_Types].xml", data: contentTypesXml(sheets) },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", data: workbookXml(sheets) },
    { name: "xl/_rels/workbook.xml.rels", data: workbookRelsXml(sheets) },
    ...sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: worksheetXml(sheet, rowsBySheet) })),
  ]);
}

async function clickAndAssertJsonResponse(page, selector, urlFragment, label, assertPayload) {
  const [response] = await Promise.all([
    page.waitForResponse((candidate) => candidate.url().includes(urlFragment) && candidate.request().method() === "POST", { timeout: 60_000 }),
    page.locator(selector).click(),
  ]);
  const payload = await response.json().catch(() => null);
  assert.equal(response.ok(), true, `${label} should return HTTP 2xx: ${JSON.stringify(payload)}`);
  assertPayload(payload);
  return payload;
}

async function runSetupWorkbookBrowserUploadJourney(page, artifactDir, setupWorkbook) {
  const workbookBuffer = buildInstitutionSetupWorkbookXlsx("browser_setup_proof");
  const workbookPath = join(artifactDir, "setup-workbook-browser-upload-proof.xlsx");
  writeFileSync(workbookPath, workbookBuffer);

  await page.locator(setupWorkbook.fileInput).setInputFiles({
    name: "setup-workbook-browser-upload-proof.xlsx",
    mimeType: XLSX_CONTENT_TYPE,
    buffer: workbookBuffer,
  });
  await page.locator(setupWorkbook.reasonInput).fill("Setup Workbook browser E2E audit/runtime proof");

  const dryRunPayload = await clickAndAssertJsonResponse(
    page,
    setupWorkbook.dryRunButton,
    "/api/setup-workbook/institution/dry-run/",
    "Setup Workbook browser dry-run upload",
    (payload) => {
      assert.equal(payload?.status, "valid", `dry-run should be valid: ${JSON.stringify(payload)}`);
      assert.ok((payload?.sheets || []).some((sheet) => (sheet.rows || []).length > 0), "dry-run should return staged workbook rows");
    },
  );
  await waitVisible(page, setupWorkbook.dryRunResult, "Setup Workbook dry-run result");
  await expectLocatorText(page, setupWorkbook.dryRunResult, "valid", "Setup Workbook dry-run card should show valid status");

  await clickAndAssertJsonResponse(
    page,
    setupWorkbook.previewButton,
    "/api/setup-workbook/institution/draft/commit-plan/",
    "Setup Workbook browser commit-plan preview",
    (payload) => {
      assert.equal(payload?.commit_allowed, true, `commit plan should be allowed: ${JSON.stringify(payload)}`);
      assert.ok((payload?.operations || []).length > 0 || Number(payload?.summary?.operation_count || 0) > 0, "commit plan should include operations");
    },
  );
  await waitVisible(page, setupWorkbook.commitPlan, "Setup Workbook commit plan result");

  await clickAndAssertJsonResponse(
    page,
    setupWorkbook.auditStageButton,
    "/api/setup-workbook/institution/draft/commit-audit-stage/",
    "Setup Workbook browser audit-stage",
    (payload) => {
      assert.equal(payload?.audit_batch_created, true, `audit-stage should create an audit batch: ${JSON.stringify(payload)}`);
      assert.equal(payload?.business_writes_performed, false, `audit-stage must not perform business writes: ${JSON.stringify(payload)}`);
    },
  );
  await waitVisible(page, setupWorkbook.auditStageResult, "Setup Workbook audit-stage result");
  await expectLocatorText(page, setupWorkbook.auditStageResult, "validated", "Setup Workbook audit-stage card should show validated batch status");

  await clickAndAssertJsonResponse(
    page,
    setupWorkbook.runtimeCommitButton,
    "/api/setup-workbook/institution/draft/runtime-commit/",
    "Setup Workbook browser runtime commit",
    (payload) => {
      assert.equal(payload?.business_writes_performed, true, `runtime commit should perform business writes: ${JSON.stringify(payload)}`);
      assert.equal(payload?.audit_batch_status, "committed", `runtime commit audit batch should be committed: ${JSON.stringify(payload)}`);
      assert.ok(Number(payload?.applied_operation_count || 0) > 0, "runtime commit should apply operations");
    },
  );
  await waitVisible(page, setupWorkbook.runtimeCommitResult, "Setup Workbook runtime-commit result");
  await expectLocatorText(page, setupWorkbook.runtimeCommitResult, "committed", "Setup Workbook runtime-commit card should show committed batch status");
  await page.screenshot({ path: join(artifactDir, "browser-e2e-setup-workbook-upload-commit.png"), fullPage: true });
  return {
    workbook_artifact: workbookPath,
    dry_run_status: dryRunPayload.status,
    staged_sheet_count: dryRunPayload.sheets?.length ?? 0,
  };
}

async function expectLocatorText(page, selector, expectedFragment, label) {
  await page.waitForFunction(
    ({ selector: selectorArg, expected }) => {
      const element = document.querySelector(selectorArg);
      return Boolean(element && element.textContent && element.textContent.includes(expected));
    },
    { selector, expected: expectedFragment },
    { timeout: 30_000 },
  );
  assert.ok(await page.locator(selector).count(), label);
}

async function runBrowserJourney() {
  if (!runEnabled) {
    console.error(
      "Browser E2E runtime is disabled. Set RETROBOLT_RUN_BROWSER_E2E=1 " +
      "in a provisioned environment with a live backend, frontend, seeded DB, and Playwright browser runtime.",
    );
    console.error(`Contract status: ${contract.status}`);
    process.exit(2);
  }

  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing browser E2E environment variables: ${missing.join(", ")}`);
  }

  const frontendBaseUrl = requireEnv("RETROBOLT_FRONTEND_BASE_URL");
  const apiBaseUrl = requireEnv("RETROBOLT_API_BASE_URL");
  const username = requireEnv("RETROBOLT_ADMIN_USERNAME");
  const password = requireEnv("RETROBOLT_ADMIN_PASSWORD");
  const artifactDir = requireEnv("RETROBOLT_E2E_ARTIFACT_DIR");
  const payloadArtifactDir = process.env.RETROBOLT_E2E_PAYLOAD_ARTIFACT_DIR;
  mkdirSync(artifactDir, { recursive: true });

  const payloadArtifacts = materializeE2ePayloadArtifactPlans(payloadContract, payloadArtifactDir);

  assert.equal(contract.production_data_allowed, false);
  assert.equal(contract.student_support_self_service_required, true);
  assert.equal(contract.student_support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);
  assert.ok(pageObjects.dbAdminBase.appShell, "DB Admin base page object should be available");
  assert.ok(pageObjects.businessWorkflows.setupWorkbook.page, "Setup Workbook overlay page object should extend DB Admin base selectors");
  assert.ok(payloadArtifacts.length >= 3, "E2E payload artifact plans should be materialized before browser actions");
  assert.ok(payloadContract.payload_case_groups.setup_workbook.includes("alpha_valid_full_setup_workbook"), "Setup Workbook payload builder should be available");
  assert.ok(fullCoverageE2eContract.journeys.length >= 5, "Full-coverage E2E user journey contract should be loaded");

  const playwright = await loadPlaywright();
  const engineName = process.env.RETROBOLT_BROWSER_ENGINE || "chromium";
  const browserType = playwright[engineName];
  if (!browserType?.launch) {
    throw new Error(`Unsupported RETROBOLT_BROWSER_ENGINE=${engineName}. Expected chromium, firefox, or webkit.`);
  }

  const consoleMessages = [];
  const pageErrors = [];
  const completedSteps = [];
  const browser = await browserType.launch({ headless: process.env.RETROBOLT_E2E_HEADLESS !== "0" });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  page.on("console", (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
  page.on("pageerror", (error) => pageErrors.push(error.message));

  try {
    await page.route("**/config.js", (route) => route.fulfill({
      contentType: "application/javascript",
      body: `window.__RETROBOLT_ADMIN_CONFIG__ = { apiBaseUrl: ${JSON.stringify(apiBaseUrl)} };\n`,
    }));

    await page.goto(frontendBaseUrl, { waitUntil: "domcontentloaded" });
    await waitVisible(page, pageObjects.dbAdminBase.loginPage, "login page");
    completedSteps.push("login_page_visible");

    await page.locator(pageObjects.dbAdminBase.username).fill(username);
    await page.locator(pageObjects.dbAdminBase.password).fill(password);
    await page.locator(pageObjects.dbAdminBase.submit).click();
    await waitVisible(page, pageObjects.dbAdminBase.appShell, "DB Admin app shell");
    await waitVisible(page, pageObjects.dbAdminBase.sidebar, "DB Admin sidebar");
    await waitVisible(page, pageObjects.dbAdminBase.main, "DB Admin main region");
    await waitVisible(page, pageObjects.dbAdminBase.workflowNav, "workflow navigation");
    await waitVisible(page, pageObjects.dbAdminBase.resourceNav, "resource navigation");
    await assertSupportControlsSelfService(page);
    completedSteps.push("authenticated_shell_visible");

    const resourceButtons = page.locator(`${pageObjects.dbAdminBase.resourceNav} button[title]`);
    const resourceCount = await resourceButtons.count();
    assert.ok(resourceCount > 0, "DB Admin resource navigation should expose at least one backend-discovered resource");
    await resourceButtons.first().click();
    await waitVisible(page, pageObjects.dbAdminBase.resourcePage, "resource page");
    await waitVisible(page, pageObjects.dbAdminBase.resourceRefresh, "resource refresh action");
    await assertSupportControlsSelfService(page);
    completedSteps.push("first_resource_page_visible");

    if (await page.locator(pageObjects.dbAdminBase.resourceQuickSearch).count()) {
      await page.locator(pageObjects.dbAdminBase.resourceQuickSearch).fill("");
      completedSteps.push("resource_quick_search_control_visible");
    }

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.setupWorkbook.nav, pageObjects.businessWorkflows.setupWorkbook.page, "Setup Workbook page");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.fileInput, "Setup Workbook file input");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.dryRunButton, "Setup Workbook dry-run button");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.previewButton, "Setup Workbook commit-plan preview button");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.auditStageButton, "Setup Workbook audit-stage button");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.runtimeCommitButton, "Setup Workbook runtime-commit button");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.reasonInput, "Setup Workbook reason input");
    await assertSupportControlsSelfService(page);
    completedSteps.push("setup_workbook_page_visible");

    const setupWorkbookJourney = await runSetupWorkbookBrowserUploadJourney(page, artifactDir, pageObjects.businessWorkflows.setupWorkbook);
    completedSteps.push("setup_workbook_xlsx_upload_audit_stage_runtime_commit");

    assert.equal(
      await page.locator(pageObjects.businessWorkflows.matrixEditor.nav).count(),
      0,
      "Matrix Editor navigation should stay absent until backend workflow catalog admission exists",
    );
    await assertSupportControlsSelfService(page);
    completedSteps.push("matrix_editor_nav_absent_without_catalog");

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.auditView.nav, pageObjects.businessWorkflows.auditView.page, "Audit page");
    await assertSupportControlsSelfService(page);
    completedSteps.push("audit_page_visible");

    assert.equal(htmlIncludes(await page.content(), "rb-resource-exposure-page"), false, "Resource Exposure must not be visible in browser runtime");
    completedSteps.push("resource_exposure_absent");

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.manualScoring.nav, pageObjects.businessWorkflows.manualScoring.page, "Manual Scoring page");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.stateFilter, "Manual Scoring state filter");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.queue, "Manual Scoring queue");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.scoreForm, "Manual Scoring form");
    await assertSupportControlsSelfService(page);
    completedSteps.push("manual_scoring_page_visible");

    await page.screenshot({ path: join(artifactDir, "browser-e2e-readonly-smoke.png"), fullPage: true });
    await writeJsonArtifact(artifactDir, "browser-e2e-readonly-smoke-summary.json", {
      status: "passed_readonly_browser_smoke",
      contract_status: contract.status,
      frontend_base_url: frontendBaseUrl,
      api_base_url: apiBaseUrl,
      engine: engineName,
      completed_steps: completedSteps,
      resource_count: resourceCount,
      setup_workbook_journey: setupWorkbookJourney,
      payload_artifacts: payloadArtifacts,
      supportControlFragmentsChecked: forbiddenSupportControlFragments,
      console_messages: consoleMessages,
      page_errors: pageErrors,
    });
  } catch (error) {
    await page.screenshot({ path: join(artifactDir, "browser-e2e-failure.png"), fullPage: true }).catch(() => undefined);
    await writeJsonArtifact(artifactDir, "browser-e2e-failure-summary.json", {
      status: "failed",
      completed_steps: completedSteps,
      error: error instanceof Error ? error.message : String(error),
      console_messages: consoleMessages,
      page_errors: pageErrors,
    });
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

await runBrowserJourney();
