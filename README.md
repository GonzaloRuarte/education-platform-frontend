# Retrobolt Runtime DB Admin Frontend

This repository contains the static frontend implementation for the Retrobolt DB Admin and workflow runtime.

Canonical documentation for product behavior, backend/frontend contracts, API payloads, selectors, permissions, runtime proof, and roadmap ownership lives in the backend repository under `docs/`. This README owns only local commands, local module ownership, and pointers to backend-owned SSOT documents/manifests.

## Local commands

The executable command SSOT is `package.json` scripts. This README names the usual entrypoints but does not own an exhaustive duplicate script inventory.

Common static checks:

```bash
npm run validate
npm run test
npm run test:code-ssot
```

Provisioned browser/runtime commands require a live backend, seeded database, and backend-generated contracts:

```bash
RETROBOLT_RUN_BROWSER_E2E=1 npm run test:e2e:browser
npm run test:docker-smoke
```

Use environment overrides when the backend checkout is not a sibling directory:

```bash
export RETROBOLT_FRONTEND_SMOKE_CONTRACT_PATH=/path/to/backend/docs/generated/frontend_browser_smoke_runtime_gates/frontend_browser_smoke_runtime_gate_manifest.json
export RETROBOLT_FRONTEND_BACKEND_SSOT_CONTRACT_PATH=/path/to/backend/docs/generated/frontend_backend_ssot_compliance/frontend_backend_ssot_compliance_manifest.json
export RETROBOLT_E2E_RUNTIME_CONTRACT_PATH=/path/to/backend/docs/generated/e2e_browser_runtime_plan/e2e_browser_runtime_plan_manifest.json
export RETROBOLT_PAGE_OBJECT_SELECTOR_CONTRACT_PATH=/path/to/backend/docs/generated/e2e_page_object_selector_contract/e2e_page_object_selector_contract_manifest.json
export RETROBOLT_E2E_PAYLOAD_CONTRACT_PATH=/path/to/backend/docs/generated/e2e_seeded_payload_contract/e2e_seeded_payload_contract_manifest.json
```

`npm run build` compiles `src/app.ts` into `dist/assets/app.js` and copies `public/*` into `dist/`. Deployment provides the backend API origin through runtime config.

## Backend documentation pointers

Use the backend documentation SSOT, especially:

- `docs/DOCS_TOPIC_OWNERSHIP_MAP.md`
- `docs/DOCS_MAINTENANCE_PLAN.md`
- `docs/DOCS_INVENTORY.md`
- `docs/guardrails/DOCUMENTATION_GUARDRAILS.md`
- `docs/guardrails/FRONTEND_RUNTIME_CONTRACT.md`
- `docs/guardrails/FRONTEND_SSOT_GUARDRAILS.md`
- `docs/current_build/FRONTEND_CURRENT_BUILD.md`
- `docs/current_build/PROVISIONED_RUNTIME_HANDOFF.md`
- `docs/generated/frontend_backend_ssot_compliance/*`
- `docs/generated/frontend_browser_smoke_runtime_gates/*`
- `docs/generated/e2e_browser_runtime_plan/*`
- `docs/generated/e2e_page_object_selector_contract/*`
- `docs/generated/e2e_seeded_payload_contract/*`

This README must not restate product policy from those docs. If frontend behavior appears to need a product rule, update the backend-owned guardrail/current-build/generated owner first and keep this README as a pointer.

## Source module ownership

Frontend modules own implementation structure, not backend policy:

- `src/app.ts` — orchestration entrypoint.
- `src/types.ts` — runtime DTO/type aliases.
- `src/i18n.ts` — localized UI copy.
- `src/dom.ts` — policy-free DOM helpers.
- `src/api.ts` — API URL/session/fetch/error helpers.
- `src/constants.ts` — runtime constants and storage/hash keys.
- `src/routes.ts` — resource hash parsing/building.
- `src/resourceEndpoints.ts` — generic resource endpoint path builders.
- `src/initialState.ts` — empty runtime state factories and storage-backed preferences.
- `src/filters.ts` — filter/sort/resource-view query-state helpers.
- `src/resourceModel.ts` — metadata-derived resource field/action/identity helpers.
- `src/fieldFormatting.ts` — policy-free field/value formatting helpers.
- `src/resourceTable.ts` — backend-metadata-driven table rendering.
- `src/relationOptions.ts` — backend-selector-driven relation option helpers.
- `src/resourceForm.ts` — backend-metadata-driven form rendering and payload extraction.
- `src/resourceFilterBuilder.ts` — backend-metadata-driven column filter UI.
- `src/auditView.ts` — audit workflow page rendering over backend APIs.
- `src/resourceExposureView.ts` — resource exposure manifest page rendering.
- `src/matrixEditorView.ts` — Matrix Editor workflow page rendering over backend APIs.
- `src/setupWorkbookView.ts` — Setup Workbook workflow page rendering over backend APIs.
- `src/appointmentApi.ts` — appointment API helper functions typed from backend contracts.
- `src/reportApi.ts` — report API helper functions typed from backend contracts.
- `src/studentExamApi.ts` — student exam/correction API helper functions typed from backend contracts.
- `src/studentExamView.ts` — student exam/correction route rendering over backend contracts.
- `src/manualScoringDrafts.ts` — local-only manual-scoring draft persistence helpers.
- `src/manualScoringView.ts` — manual-scoring workflow rendering over backend contracts.
- `src/testIds.ts` — selector exports validated against backend-generated page-object contracts.

None of these modules may become a frontend source of truth for resource exposure, permissions, validators, relation scope, workflow eligibility, business state transitions, exam policy, report policy, or correction policy.

## Documentation rule

The frontend README is pointer-only for canonical behavior and local module ownership. Completed target behavior belongs in backend guardrails; current implementation status belongs in backend current-build docs; detailed evidence belongs in backend generated manifests.
