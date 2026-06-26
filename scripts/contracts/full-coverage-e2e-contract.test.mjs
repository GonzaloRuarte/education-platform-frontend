import { assertFullCoverageE2eContract } from "./full-coverage-e2e-contract.mjs";

const manifest = assertFullCoverageE2eContract();
console.log(`full-coverage E2E contract OK: ${manifest.actors.length} actors, ${manifest.journeys.length} journeys`);
