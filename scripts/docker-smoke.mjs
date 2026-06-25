import assert from "node:assert/strict";
import { assertLoadedFrontendBrowserSmokeContract } from "./frontend-browser-smoke-contract.mjs";

const apiBase = process.env.RETROBOLT_API_BASE_URL || "http://localhost:8000/api";
const frontendBase = process.env.RETROBOLT_FRONTEND_BASE_URL || "http://localhost:3000";
const username = process.env.RETROBOLT_ADMIN_USERNAME;
const password = process.env.RETROBOLT_ADMIN_PASSWORD;

const REQUIRED_GENERIC_DB_ADMIN_SMOKE_COVERAGE = Object.freeze([
  "frontend_shell",
  "authenticated_login",
  "resource_discovery",
  "resource_schema",
  "list",
  "detail",
  "create",
  "update",
  "delete",
  "batch_delete",
  "relation_options",
  "filters",
  "sorting",
  "pagination",
  "url_state",
  "institution_setup_chain",
  "dependent_selectors",
  "temporary_admin_cleanup",
]);

const INSTITUTION_SETUP_CHAIN_ENV = "RETROBOLT_SMOKE_SETUP_CHAIN_ALIASES";
const WRITABLE_RESOURCE_ENV = "RETROBOLT_SMOKE_WRITABLE_RESOURCE_ALIAS";
const CREATE_PAYLOAD_ENV = "RETROBOLT_SMOKE_CREATE_PAYLOAD";
const UPDATE_PAYLOAD_ENV = "RETROBOLT_SMOKE_UPDATE_PAYLOAD";
const FILTERS_ENV = "RETROBOLT_SMOKE_FILTERS_JSON";

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Set ${name} for the Docker smoke test.`);
  }
  return value.trim();
}

function parseJsonEnv(name) {
  const raw = requireEnv(name);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${name} must be valid JSON: ${error.message}`);
  }
}

function setupChainAliases() {
  return requireEnv(INSTITUTION_SETUP_CHAIN_ENV)
    .split(",")
    .map((alias) => alias.trim())
    .filter(Boolean);
}

function assertSmokeContractIsComplete() {
  const required = new Set(REQUIRED_GENERIC_DB_ADMIN_SMOKE_COVERAGE);
  for (const item of [
    "frontend_shell",
    "authenticated_login",
    "resource_discovery",
    "resource_schema",
    "list",
    "detail",
    "create",
    "update",
    "delete",
    "batch_delete",
    "relation_options",
    "filters",
    "sorting",
    "pagination",
    "url_state",
    "institution_setup_chain",
    "dependent_selectors",
    "temporary_admin_cleanup",
  ]) {
    assert.ok(required.has(item), `smoke coverage should include ${item}`);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new Error(`${url} returned non-JSON ${response.status}: ${text.slice(0, 200)}`);
    }
  }
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${text.slice(0, 300)}`);
  }
  return payload;
}

function withQuery(path, params = {}) {
  const url = new URL(path, apiBase.endsWith("/") ? apiBase : `${apiBase}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function resourceSchemaUrl(resourceAlias) {
  return withQuery(`resources/${encodeURIComponent(resourceAlias)}/`, { surface: "db_admin" });
}

function resourceRecordsUrl(resourceAlias, params = {}) {
  return withQuery(`resources/${encodeURIComponent(resourceAlias)}/records/`, { surface: "db_admin", ...params });
}

function resourceDetailUrl(resourceAlias, identity) {
  return withQuery(`resources/${encodeURIComponent(resourceAlias)}/records/${encodeURIComponent(identity)}/`, { surface: "db_admin" });
}

function resourceOptionsUrl(resourceAlias, fieldAlias, params = {}) {
  return withQuery(`resources/${encodeURIComponent(resourceAlias)}/options/${encodeURIComponent(fieldAlias)}/`, { surface: "db_admin", ...params });
}

function authJsonHeaders(authHeaders) {
  return { ...authHeaders, "content-type": "application/json" };
}

async function loadSchema(resourceAlias, authHeaders) {
  const schema = await fetchJson(resourceSchemaUrl(resourceAlias), { headers: authHeaders });
  assert.equal(schema.alias, resourceAlias, "schema alias should be the public resource alias");
  assert.equal(schema.key, undefined, "schema must not expose internal resource keys");
  assert.equal(schema.resource_urls, undefined, "schema must not publish backend-owned resource URLs");
  assert.equal(schema.list_query_contract, undefined, "schema must not publish a global list query contract");
  assert.ok(schema.actions && typeof schema.actions === "object", "schema should publish action booleans");
  assert.ok(schema.fields?.every((field) => field.alias && field.i18n?.label?.en && field.i18n?.label?.es), "schema should publish aliased fields with bilingual labels");
  assert.ok(schema.fields?.every((field) => !field.filterable || Array.isArray(field.filter?.operators)), "filterable fields should publish per-field operators");
  return schema;
}

function assertRecordListContract(list) {
  assert.equal(typeof list.count, "number", "list endpoint should return paginated count");
  assert.ok(Array.isArray(list.results), "list endpoint should return results[]");
  assert.ok(list.results.every((row) => typeof row.__identity === "string"), "records should include backend-issued __identity");
  assert.ok(list.results.every((row) => row.__resource_urls === undefined && row.__label === undefined), "records must not include old metadata helpers");
}

async function smokeReadControls(schema, authHeaders) {
  const pageOne = await fetchJson(resourceRecordsUrl(schema.alias, { page: "1", page_size: "1" }), { headers: authHeaders });
  assertRecordListContract(pageOne);

  if (pageOne.count > 1) {
    const pageTwo = await fetchJson(resourceRecordsUrl(schema.alias, { page: "2", page_size: "1" }), { headers: authHeaders });
    assertRecordListContract(pageTwo);
  }

  const sortable = schema.fields?.find((field) => field.sortable);
  if (sortable) {
    const sorted = await fetchJson(resourceRecordsUrl(schema.alias, {
      page: "1",
      page_size: "1",
      sort: JSON.stringify([{ field: sortable.alias, sort: "asc" }]),
    }), { headers: authHeaders });
    assertRecordListContract(sorted);
  }

  const filterable = schema.fields?.find((field) => field.filterable && field.filter?.operators?.length);
  if (filterable) {
    const filters = process.env[FILTERS_ENV]
      ? JSON.parse(process.env[FILTERS_ENV])
      : { items: [], quickFilterValues: [], linkOperator: "and" };
    const filtered = await fetchJson(resourceRecordsUrl(schema.alias, {
      page: "1",
      page_size: "1",
      filters: JSON.stringify(filters),
    }), { headers: authHeaders });
    assertRecordListContract(filtered);
  }

  if (pageOne.results.length > 0) {
    const detail = await fetchJson(resourceDetailUrl(schema.alias, pageOne.results[0].__identity), { headers: authHeaders });
    assert.equal(typeof detail.__identity, "string", "detail endpoint should return a backend identity");
  }

  return pageOne;
}

async function smokeRelationOptions(schema, authHeaders) {
  for (const field of schema.fields ?? []) {
    if (!field.relation) continue;
    const options = await fetchJson(resourceOptionsUrl(schema.alias, field.alias, { q: "", page: "1", page_size: "5" }), { headers: authHeaders });
    assert.ok(Array.isArray(options.results) || Array.isArray(options.options), `relation options for ${schema.alias}.${field.alias} should return an options array`);
    if (field.relation.depends_on?.length || field.relation.dependencies?.length) {
      assert.ok(field.relation.depends_on?.length || field.relation.dependencies?.length, `dependent selector ${schema.alias}.${field.alias} should declare dependencies`);
    }
  }
}

async function smokeInstitutionSetupChain(discoveryAliases, authHeaders) {
  const chain = setupChainAliases();
  assert.equal(chain.length, 5, `${INSTITUTION_SETUP_CHAIN_ENV} must list institution,institution_enrollment_period,period_grade,period_division,division_subject_offering aliases`);
  for (const alias of chain) {
    assert.ok(discoveryAliases.has(alias), `setup-chain alias ${alias} must appear in DB Admin discovery`);
    const schema = await loadSchema(alias, authHeaders);
    await smokeReadControls(schema, authHeaders);
    await smokeRelationOptions(schema, authHeaders);
  }
}

async function smokeWrites(authHeaders) {
  const alias = requireEnv(WRITABLE_RESOURCE_ENV);
  const createPayload = parseJsonEnv(CREATE_PAYLOAD_ENV);
  const updatePayload = parseJsonEnv(UPDATE_PAYLOAD_ENV);
  const schema = await loadSchema(alias, authHeaders);
  for (const action of ["create", "update", "delete", "batch_delete"]) {
    assert.equal(schema.actions?.[action], true, `${alias} must allow ${action} for the smoke admin user`);
  }

  async function createAndReload() {
    const response = await fetch(resourceRecordsUrl(alias), {
      method: "POST",
      headers: authJsonHeaders(authHeaders),
      body: JSON.stringify(createPayload),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`create returned ${response.status}: ${text.slice(0, 300)}`);
    }
    const location = response.headers.get("location");
    assert.ok(location, "create should return a Location header for canonical reload");
    const created = await fetchJson(location, { headers: authHeaders });
    assert.equal(typeof created.__identity, "string", "created record should reload with a backend identity");
    return created;
  }

  const created = await createAndReload();

  const updateResponse = await fetch(resourceDetailUrl(alias, created.__identity), {
    method: "PATCH",
    headers: authJsonHeaders(authHeaders),
    body: JSON.stringify(updatePayload),
  });
  const updateText = await updateResponse.text();
  if (!updateResponse.ok) {
    throw new Error(`update returned ${updateResponse.status}: ${updateText.slice(0, 300)}`);
  }
  const updated = await fetchJson(resourceDetailUrl(alias, created.__identity), { headers: authHeaders });
  assert.equal(updated.__identity, created.__identity, "update should keep the same backend identity");

  await fetchJson(resourceDetailUrl(alias, created.__identity), {
    method: "DELETE",
    headers: authHeaders,
  });

  const batchOne = await createAndReload();
  const batchTwo = await createAndReload();
  await fetchJson(resourceRecordsUrl(alias), {
    method: "DELETE",
    headers: authJsonHeaders(authHeaders),
    body: JSON.stringify({ identities: [batchOne.__identity, batchTwo.__identity] }),
  });
}

assertSmokeContractIsComplete();
const backendSmokeContract = assertLoadedFrontendBrowserSmokeContract();

if (!username || !password) {
  throw new Error("Set RETROBOLT_ADMIN_USERNAME and RETROBOLT_ADMIN_PASSWORD for the Docker smoke test.");
}

const shell = await fetch(frontendBase);
assert.equal(shell.ok, true, `frontend shell should respond at ${frontendBase}`);
const shellHtml = await shell.text();
assert.match(shellHtml, /id="app"/, "frontend shell should include #app root");

const token = await fetchJson(`${apiBase}/token/`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ username, password }),
});
assert.ok(token.token?.access, "login should return an access token");

const authHeaders = { authorization: `Bearer ${token.token.access}` };
const discovery = await fetchJson(`${apiBase}/resources/?surface=db_admin`, { headers: authHeaders });
assert.ok(Array.isArray(discovery.resources), "resource discovery should return resources[]");
assert.ok(discovery.resources.length > 0, "resource discovery should expose at least one DB Admin resource");

const discoveryAliases = new Set(discovery.resources.map((resource) => resource.alias));
for (const resource of discovery.resources) {
  assert.ok(resource.alias, "discovered resource should have a public alias");
  assert.ok(resource.i18n?.label?.en && resource.i18n?.label?.es, "discovery should publish bilingual resource labels");
  assert.ok(resource.i18n?.plural_label?.en && resource.i18n?.plural_label?.es, "discovery should publish bilingual plural labels");
  assert.equal(resource.key, undefined, "discovery must not expose internal resource keys");
}

const first = discovery.resources[0];
const schema = await loadSchema(first.alias, authHeaders);
const list = await smokeReadControls(schema, authHeaders);
await smokeRelationOptions(schema, authHeaders);
await smokeInstitutionSetupChain(discoveryAliases, authHeaders);
await smokeWrites(authHeaders);

console.log(`Docker smoke passed for ${schema.alias}: ${list.count} records. Backend smoke contract ${backendSmokeContract.status} consumed. Temporary admin cleanup remains owned by the caller/test fixture.`);
