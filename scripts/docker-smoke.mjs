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
assert.ok(token.access, "login should return an access token");

const authHeaders = { authorization: `Bearer ${token.access}` };
const discovery = await fetchJson(`${apiBase}/resources/?surface=db_admin`, { headers: authHeaders });
assert.ok(Array.isArray(discovery.resources), "resource discovery should return resources[]");
assert.ok(discovery.resources.length > 0, "resource discovery should expose at least one DB Admin resource");

const first = discovery.resources[0];
assert.ok(first.key, "discovered resource should have a key");
const schema = await fetchJson(`${apiBase}/resources/${encodeURIComponent(first.key)}/?surface=db_admin`, { headers: authHeaders });
assert.equal(schema.key, first.key, "schema key should match discovered resource key");
assert.ok(schema.resource_urls?.list, "schema should publish backend-owned list URL");
assert.ok(schema.testing_contract?.status === "complete", "schema should publish the complete testing contract");
assert.ok(schema.authorization_contract, "schema should publish authorization contract");
assert.ok(schema.migration_safety_contract, "schema should publish migration safety contract");

const listUrl = new URL(schema.resource_urls.list, apiBase.replace(/\/api\/?$/, ""));
const list = await fetchJson(listUrl.toString(), { headers: authHeaders });
assert.equal(typeof list.count, "number", "list endpoint should return paginated count");
assert.ok(Array.isArray(list.results), "list endpoint should return results[]");

console.log(`Docker smoke passed for ${first.key}: ${list.count} records.`);
