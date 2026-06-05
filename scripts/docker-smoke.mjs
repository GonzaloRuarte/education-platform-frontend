import assert from "node:assert/strict";

const apiBase = process.env.RETROBOLT_API_BASE_URL || "http://localhost:8000/api";
const frontendBase = process.env.RETROBOLT_FRONTEND_BASE_URL || "http://localhost:3000";
const username = process.env.RETROBOLT_ADMIN_USERNAME;
const password = process.env.RETROBOLT_ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error("Set RETROBOLT_ADMIN_USERNAME and RETROBOLT_ADMIN_PASSWORD for the Docker smoke test.");
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

const first = discovery.resources[0];
assert.ok(first.alias, "discovered resource should have a public alias");
assert.ok(first.i18n?.label?.en && first.i18n?.label?.es, "discovery should publish bilingual resource labels");
assert.ok(first.i18n?.plural_label?.en && first.i18n?.plural_label?.es, "discovery should publish bilingual plural labels");
assert.equal(first.key, undefined, "discovery must not expose internal resource keys");

const schema = await fetchJson(`${apiBase}/resources/${encodeURIComponent(first.alias)}/?surface=db_admin`, { headers: authHeaders });
assert.equal(schema.key, first.alias, "schema key should be the public resource alias");
assert.ok(!schema.alias || schema.alias === schema.key, "schema alias should be absent or match the public resource alias");
assert.equal(schema.resource_urls, undefined, "schema must not publish backend-owned resource URLs");
assert.equal(schema.list_query_contract, undefined, "schema must not publish a global list query contract");
assert.ok(schema.actions && typeof schema.actions === "object", "schema should publish action booleans");
assert.ok(schema.fields?.every((field) => field.key && field.i18n?.label?.en && field.i18n?.label?.es), "schema should publish aliased fields with bilingual labels");
assert.ok(schema.fields?.every((field) => !field.filterable || Array.isArray(field.filter?.operators)), "filterable fields should publish per-field operators");

const list = await fetchJson(`${apiBase}/resources/${encodeURIComponent(schema.key)}/records/?surface=db_admin`, { headers: authHeaders });
assert.equal(typeof list.count, "number", "list endpoint should return paginated count");
assert.ok(Array.isArray(list.results), "list endpoint should return results[]");
assert.ok(list.results.every((row) => typeof row.__identity === "string"), "records should include backend-issued __identity");
assert.ok(list.results.every((row) => row.__resource_urls === undefined && row.__label === undefined), "records must not include old metadata helpers");

console.log(`Docker smoke passed for ${schema.key}: ${list.count} records.`);
