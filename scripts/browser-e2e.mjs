import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { assertLoadedE2eRuntimeContract } from "./e2e-runtime-contract.mjs";
import { buildBrowserPageObjects } from "./browser-page-objects.mjs";
import { assertLoadedE2ePayloadContract, materializeE2ePayloadArtifactPlans } from "./e2e-payload-contract.mjs";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
const contract = assertLoadedE2eRuntimeContract();
const pageObjects = buildBrowserPageObjects();
const payloadContract = assertLoadedE2ePayloadContract();
const runEnabled = process.env.RETROBOLT_RUN_BROWSER_E2E === "1";

const requiredEnv = [
  "RETROBOLT_FRONTEND_BASE_URL",
  "RETROBOLT_API_BASE_URL",
  "RETROBOLT_ADMIN_USERNAME",
  "RETROBOLT_ADMIN_PASSWORD",
  "RETROBOLT_E2E_ARTIFACT_DIR",
];

const forbiddenPinFragments = Object.freeze([
  "support_pin",
  "accessibility_pin",
  "student_pin",
  "second_support_pin",
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

async function clickAndWaitVisible(page, clickSelector, visibleSelector, label) {
  await page.locator(clickSelector).click();
  await waitVisible(page, visibleSelector, label);
}

async function assertNoSecondPinFragments(page) {
  const html = await page.content();
  for (const fragment of forbiddenPinFragments) {
    assert.equal(html.includes(fragment), false, `browser E2E page must not expose forbidden second-PIN fragment ${fragment}`);
  }
}

async function writeJsonArtifact(artifactDir, filename, payload) {
  const path = join(artifactDir, filename);
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
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
  assert.equal(contract.second_exam_support_pin_required, false);
  assert.equal(contract.student_support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);
  assert.ok(pageObjects.dbAdminBase.appShell, "DB Admin base page object should be available");
  assert.ok(pageObjects.businessWorkflows.setupWorkbook.page, "Setup Workbook overlay page object should extend DB Admin base selectors");
  assert.ok(payloadArtifacts.length >= 3, "E2E payload artifact plans should be materialized before browser actions");
  assert.ok(payloadContract.payload_case_groups.setup_workbook.includes("alpha_valid_full_setup_workbook"), "Setup Workbook payload builder should be available");

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
    await assertNoSecondPinFragments(page);
    completedSteps.push("authenticated_shell_visible");

    const resourceButtons = page.locator(`${pageObjects.dbAdminBase.resourceNav} button[title]`);
    const resourceCount = await resourceButtons.count();
    assert.ok(resourceCount > 0, "DB Admin resource navigation should expose at least one backend-discovered resource");
    await resourceButtons.first().click();
    await waitVisible(page, pageObjects.dbAdminBase.resourcePage, "resource page");
    await waitVisible(page, pageObjects.dbAdminBase.resourceRefresh, "resource refresh action");
    await assertNoSecondPinFragments(page);
    completedSteps.push("first_resource_page_visible");

    if (await page.locator(pageObjects.dbAdminBase.resourceQuickSearch).count()) {
      await page.locator(pageObjects.dbAdminBase.resourceQuickSearch).fill("");
      completedSteps.push("resource_quick_search_control_visible");
    }

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.setupWorkbook.nav, pageObjects.businessWorkflows.setupWorkbook.page, "Setup Workbook page");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.fileInput, "Setup Workbook file input");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.dryRunButton, "Setup Workbook dry-run button");
    await waitVisible(page, pageObjects.businessWorkflows.setupWorkbook.previewButton, "Setup Workbook commit-plan preview button");
    await assertNoSecondPinFragments(page);
    completedSteps.push("setup_workbook_page_visible");

    assert.equal(
      await page.locator(pageObjects.businessWorkflows.matrixEditor.nav).count(),
      0,
      "Matrix Editor navigation should stay absent until backend workflow catalog admission exists",
    );
    await assertNoSecondPinFragments(page);
    completedSteps.push("matrix_editor_nav_absent_without_catalog");

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.auditView.nav, pageObjects.businessWorkflows.auditView.page, "Audit page");
    await assertNoSecondPinFragments(page);
    completedSteps.push("audit_page_visible");

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.resourceExposure.nav, pageObjects.businessWorkflows.resourceExposure.page, "Resource Exposure page");
    await assertNoSecondPinFragments(page);
    completedSteps.push("resource_exposure_page_visible");

    await clickAndWaitVisible(page, pageObjects.businessWorkflows.manualScoring.nav, pageObjects.businessWorkflows.manualScoring.page, "Manual Scoring page");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.stateFilter, "Manual Scoring state filter");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.queue, "Manual Scoring queue");
    await waitVisible(page, pageObjects.businessWorkflows.manualScoring.scoreForm, "Manual Scoring form");
    await assertNoSecondPinFragments(page);
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
      payload_artifacts: payloadArtifacts,
      forbidden_pin_fragments_checked: forbiddenPinFragments,
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
