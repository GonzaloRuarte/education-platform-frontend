param(
    [string]$ComposeRepo = "C:\Users\Gonzalo\repos\meta-frontend",
    [string]$BackendRepo = "C:\Users\Gonzalo\repos\meta-backend",
    [switch]$SkipFrontendValidate = $false,
    [switch]$SkipFrontendContracts = $false,
    [switch]$SkipBrowserE2E = $false,
    [switch]$ShowBackendDebug
)

$ErrorActionPreference = "Stop"

function Write-FilteredOutput {
    param([object[]]$OutputLines)
    foreach ($line in $OutputLines) {
        $text = [string]$line
        if (!$ShowBackendDebug -and $text -match '^\s*\[DEBUG\]') { continue }
        Write-Host $text
    }
}

function Run-Step {
    param([string]$Name, [scriptblock]$Command)
    Write-Host "`n================================================================================" -ForegroundColor Cyan
    Write-Host $Name -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    $global:LASTEXITCODE = 0
    & $Command
    if ($LASTEXITCODE -ne 0) { throw "Step failed: $Name" }
}

function Resolve-BackendRepoForFrontendContracts {
    $candidatePaths = @(
        $BackendRepo,
        (Join-Path $ComposeRepo "backend")
    )

    foreach ($candidate in $candidatePaths) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        $manifest = Join-Path $candidate "docs\generated\frontend_backend_ssot_compliance\frontend_backend_ssot_compliance_manifest.json"
        if (Test-Path $manifest) { return (Resolve-Path $candidate).Path }
    }

    throw "Backend SSOT manifest not found. Run backend artifact generation and pass -BackendRepo pointing at the backend repo containing docs\generated\frontend_backend_ssot_compliance\frontend_backend_ssot_compliance_manifest.json."
}

# Use a one-off backend container for setup steps so the backend service startup command
# cannot run migrations/bootstrap concurrently with seed or generated-policy DDL.
function Run-Backend-Once {
    param([string]$Name, [string]$ShellCommand)
    Run-Step $Name {
        $output = docker compose run --rm --no-deps -T backend sh -lc $ShellCommand 2>&1
        $exitCode = $LASTEXITCODE
        Write-FilteredOutput $output
        if ($exitCode -ne 0) { throw "Step failed: $Name (exit code $exitCode)" }
    }
}

# Use exec only after the long-running backend service has been started.
function Run-Backend-Exec {
    param([string]$Name, [string]$ShellCommand)
    Run-Step $Name {
        $output = docker compose exec -T backend sh -lc $ShellCommand 2>&1
        $exitCode = $LASTEXITCODE
        Write-FilteredOutput $output
        if ($exitCode -ne 0) { throw "Step failed: $Name (exit code $exitCode)" }
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = Join-Path $ComposeRepo "fresh_zero_validation_$timestamp.log"

# pytest-django is not guaranteed to bootstrap Django before collection in this repo.
# This wrapper configures settings and calls django.setup() before pytest imports tests.
$PytestWithDjango = 'python -c "import os, sys; os.environ.setdefault(''DJANGO_SETTINGS_MODULE'', ''config.settings''); import django; django.setup(); import pytest; raise SystemExit(pytest.main(sys.argv[1:]))"'

Push-Location $ComposeRepo
Start-Transcript -Path $logPath | Out-Null

try {
    Run-Step "Confirm repo paths" {
        Write-Host "Compose repo: $ComposeRepo"
        if (Test-Path $BackendRepo) { Write-Host "Backend repo: $BackendRepo" }
        else {
            Write-Host "Backend repo path not found: $BackendRepo" -ForegroundColor Yellow
            Write-Host "Continuing because this runner uses docker compose from the compose repo." -ForegroundColor Yellow
        }
    }

    Run-Step "Fresh Docker reset: down -v" { docker compose down -v --remove-orphans }

    Run-Step "Build backend image" { docker compose build backend }

    Run-Step "Start database only" {
        docker compose up -d db
        Start-Sleep -Seconds 5
    }

    Run-Step "Wait for Postgres" {
        $ready = $false
        for ($i = 1; $i -le 60; $i++) {
            docker compose exec -T db pg_isready -U retrobolt -d retrobolt
            if ($LASTEXITCODE -eq 0) { $ready = $true; break }
            Start-Sleep -Seconds 2
        }
        if (!$ready) { throw "Postgres did not become ready" }
    }

    Run-Backend-Once "Migrate and bootstrap predefined global roles" "python manage.py migrate --noinput && python manage.py bootstrap_predefined_roles && python manage.py bootstrap_predefined_roles --verify-only"

    Run-Backend-Once "Verify predefined roles before seed dry run" "python manage.py bootstrap_predefined_roles && python manage.py bootstrap_predefined_roles --verify-only"

    Run-Backend-Once "Cold-start seed dry run" "mkdir -p /tmp/runtime_artifacts && python manage.py seed_cold_start_demo_data --dry-run --summary-json /tmp/runtime_artifacts/cold_start_seed_dry_run_summary.json"

    Run-Backend-Once "Verify predefined roles before reset seed" "python manage.py bootstrap_predefined_roles && python manage.py bootstrap_predefined_roles --verify-only"

    Run-Backend-Once "Cold-start seed reset" "python manage.py seed_cold_start_demo_data --reset --no-input --summary-json /tmp/runtime_artifacts/cold_start_seed_summary.json"

    # If reset ever removes global Role rows, this re-establishes the bootstrap invariant
    # before idempotency checks and makes the violation visible in test output later.
    Run-Backend-Once "Verify predefined roles before idempotency seed" "python manage.py bootstrap_predefined_roles && python manage.py bootstrap_predefined_roles --verify-only"

    Run-Backend-Once "Cold-start seed idempotency pass" "python manage.py seed_cold_start_demo_data --summary-json /tmp/runtime_artifacts/cold_start_seed_idempotency_summary.json"

    Run-Backend-Once "Generate DB Admin artifacts" "python manage.py check_db_admin_generated_artifacts --write --json"

    Run-Backend-Once "Verify generated DB Admin artifacts are clean" "python manage.py check_db_admin_generated_artifacts --json"

    Run-Step "Apply generated DB Admin database policy SQL" {
        # Do not export SQL through docker stdout on Windows. Docker can print
        # console-mode warnings to stdout, which corrupts the SQL file. The
        # generated artifacts command writes into the mounted backend repo, so
        # copy the host file directly into the db container and execute it there.
        $candidatePaths = @(
            (Join-Path $BackendRepo "docs\generated\db_admin\db_admin_database_policy.sql"),
            (Join-Path $ComposeRepo "backend\docs\generated\db_admin\db_admin_database_policy.sql"),
            (Join-Path $ComposeRepo "docs\generated\db_admin\db_admin_database_policy.sql")
        )

        $policyPath = $null
        foreach ($candidate in $candidatePaths) {
            if (Test-Path $candidate) { $policyPath = (Resolve-Path $candidate).Path; break }
        }
        if (!$policyPath) {
            throw "Generated policy SQL not found in backend repo. Checked: $($candidatePaths -join '; ')"
        }
        if ((Get-Item $policyPath).Length -le 0) {
            throw "Generated policy SQL is empty: $policyPath"
        }

        $firstLines = Get-Content -Path $policyPath -TotalCount 5
        foreach ($line in $firstLines) {
            if ($line -match 'failed to get console mode|The handle is invalid|^\s*\[\+\]|^\s*✔') {
                throw "Generated policy SQL appears contaminated by Docker console output: $policyPath"
            }
        }

        Write-Host "Using generated policy SQL: $policyPath"
        docker compose cp $policyPath db:/tmp/db_admin_database_policy.sql
        $copyExitCode = $LASTEXITCODE
        if ($copyExitCode -ne 0) { throw "Step failed: copy generated DB Admin policy SQL into db container (exit code $copyExitCode)" }

        $output = docker compose exec -T db psql -U retrobolt -d retrobolt -v ON_ERROR_STOP=1 -f /tmp/db_admin_database_policy.sql 2>&1
        $psqlExitCode = $LASTEXITCODE
        Write-FilteredOutput $output
        if ($psqlExitCode -ne 0) { throw "Step failed: Apply generated DB Admin database policy SQL (exit code $psqlExitCode)" }
    }

    Run-Backend-Once "Verify predefined roles after policy apply" "python manage.py bootstrap_predefined_roles --verify-only"

    Run-Step "Start backend service after database setup" {
        docker compose up -d backend
        Start-Sleep -Seconds 20
    }

    Run-Backend-Exec "Backend service readiness check" "python manage.py bootstrap_predefined_roles --verify-only"

    # Contract tests import DRF/Django modules at collection time; configure settings explicitly.
    #Run-Backend-Exec "Backend contract/static tests" "$PytestWithDjango retrobolt_product/tests/contracts -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    Run-Backend-Exec "All non-browser runtime gates with provisioned flags" "mkdir -p /tmp/setup_workbook_runtime_artifacts /tmp/browser_e2e_artifacts && RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 RETROBOLT_RUN_GENERATED_AUTHORIZATION_RUNTIME=1 RETROBOLT_RUN_SETUP_WORKBOOK_RUNTIME_PROOF=1 RETROBOLT_API_BASE_URL=http://localhost:8000 RETROBOLT_SETUP_WORKBOOK_RUNTIME_FIXTURES_JSON=/application/docs/generated/setup_workbook_runtime_proof/setup_workbook_runtime_fixture_template.json RETROBOLT_SETUP_WORKBOOK_ARTIFACT_DIR=/tmp/setup_workbook_runtime_artifacts $PytestWithDjango retrobolt_product/tests/runtime_gates -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    Run-Backend-Exec "Focused generic CRUD runtime gate" "RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 $PytestWithDjango retrobolt_product/tests/runtime_gates/test_generic_crud_runtime_gates.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    Run-Backend-Exec "Focused generated authorization runtime gates" "RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 RETROBOLT_RUN_GENERATED_AUTHORIZATION_RUNTIME=1 $PytestWithDjango retrobolt_product/tests/runtime_gates/test_generated_authorization_api_matrix_runtime.py retrobolt_product/tests/runtime_gates/test_generated_authorization_data_matrix_runtime.py retrobolt_product/tests/runtime_gates/test_generated_authorization_db_policy_runtime.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    Run-Backend-Exec "Focused full coverage API runtime gate" "RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 $PytestWithDjango retrobolt_product/tests/runtime_gates/test_full_coverage_api_runtime_gates.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    Run-Backend-Exec "Focused setup workbook runtime proof" "mkdir -p /tmp/setup_workbook_runtime_artifacts && RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 RETROBOLT_RUN_SETUP_WORKBOOK_RUNTIME_PROOF=1 RETROBOLT_API_BASE_URL=http://localhost:8000 RETROBOLT_SETUP_WORKBOOK_RUNTIME_FIXTURES_JSON=/application/docs/generated/setup_workbook_runtime_proof/setup_workbook_runtime_fixture_template.json RETROBOLT_SETUP_WORKBOOK_ARTIFACT_DIR=/tmp/setup_workbook_runtime_artifacts $PytestWithDjango retrobolt_product/tests/runtime_gates/test_setup_workbook_runtime_proof_gates.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    # TODO: Add the real Setup Workbook browser/API runtime journey once implemented:
    # XLSX upload -> dry run/preview -> audit-stage -> runtime commit -> DbAdminMutationBatch verification
    # plus negative unsupported/cross-org payload and rollback assertions.

    Run-Backend-Exec "Focused student exam access runtime gate" "RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 RETROBOLT_RUN_GENERATED_AUTHORIZATION_RUNTIME=1 $PytestWithDjango retrobolt_product/tests/runtime_gates/test_student_exam_access_runtime.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

    if (!$SkipFrontendValidate) {
        Run-Step "Frontend validate in Node Docker" {
            $frontend = (Resolve-Path $ComposeRepo).Path
            docker run --rm -v "${frontend}:/app" -v meta_frontend_node_modules:/app/node_modules -w /app node:20-bookworm-slim sh -lc "npm install && npm run validate"
        }
    }

    if (!$SkipFrontendContracts) {
        Run-Step "Frontend contract tests in Node Docker" {
            $frontend = (Resolve-Path $ComposeRepo).Path
            $backendForContracts = Resolve-BackendRepoForFrontendContracts
            Write-Host "Using backend SSOT contract repo: $backendForContracts"
            docker run --rm `
                -v "${frontend}:/app" `
                -v "${backendForContracts}:/backend:ro" `
                -v meta_frontend_node_modules:/app/node_modules `
                -e RETROBOLT_FRONTEND_BACKEND_SSOT_CONTRACT_PATH=/backend/docs/generated/frontend_backend_ssot_compliance/frontend_backend_ssot_compliance_manifest.json `
                -e RETROBOLT_FRONTEND_SMOKE_CONTRACT_PATH=/backend/docs/generated/frontend_browser_smoke_runtime_gates/frontend_browser_smoke_runtime_gate_manifest.json `
                -e RETROBOLT_E2E_RUNTIME_CONTRACT_PATH=/backend/docs/generated/e2e_browser_runtime_plan/e2e_browser_runtime_plan_manifest.json `
                -e RETROBOLT_PAGE_OBJECT_SELECTOR_CONTRACT_PATH=/backend/docs/generated/e2e_page_object_selector_contract/e2e_page_object_selector_contract_manifest.json `
                -e RETROBOLT_E2E_PAYLOAD_CONTRACT_PATH=/backend/docs/generated/e2e_seeded_payload_contract/e2e_seeded_payload_contract_manifest.json `
                -w /app node:20-bookworm-slim sh -lc "npm install && npm run test:frontend-contracts"
        }
    }

    if (!$SkipBrowserE2E) {
        Run-Step "Start frontend dev server for browser E2E" {
            $frontend = (Resolve-Path $ComposeRepo).Path
            docker rm -f retrobolt_frontend_dev_e2e 2>$null | Out-Null
            docker run -d --name retrobolt_frontend_dev_e2e -p 5173:5173 -v "${frontend}:/app" -v meta_frontend_node_modules:/app/node_modules -w /app node:20-bookworm-slim sh -lc "npm install && npm run dev -- --host 0.0.0.0"
            Start-Sleep -Seconds 20
        }
        try {
            Run-Backend-Exec "Browser E2E runtime gates" "mkdir -p /tmp/browser_e2e_artifacts && RETROBOLT_RUN_PROVISIONED_RUNTIME_GATES=1 RETROBOLT_RUN_GENERATED_AUTHORIZATION_RUNTIME=1 RETROBOLT_RUN_BROWSER_E2E=1 RETROBOLT_FRONTEND_BASE_URL=http://localhost:5173 RETROBOLT_API_BASE_URL=http://localhost:8000 RETROBOLT_ADMIN_USERNAME=full-coverage-admin RETROBOLT_ADMIN_PASSWORD=admin-change-me RETROBOLT_E2E_ARTIFACT_DIR=/tmp/browser_e2e_artifacts $PytestWithDjango retrobolt_product/tests/runtime_gates/test_browser_e2e_runtime_gates.py retrobolt_product/tests/runtime_gates/test_generated_authorization_frontend_e2e_runtime.py -q -rs --tb=short --show-capture=no --log-level=WARNING -p no:cacheprovider"

            Run-Step "Frontend browser E2E in Node Docker" {
                $frontend = (Resolve-Path $ComposeRepo).Path
                $backendForContracts = Resolve-BackendRepoForFrontendContracts
                Write-Host "Using backend browser E2E contract repo: $backendForContracts"
                $frontendBrowserArtifacts = Join-Path $ComposeRepo "browser_e2e_artifacts"
                $frontendBrowserPayloadArtifacts = Join-Path $frontendBrowserArtifacts "payloads"
                New-Item -ItemType Directory -Force -Path $frontendBrowserArtifacts | Out-Null
                New-Item -ItemType Directory -Force -Path $frontendBrowserPayloadArtifacts | Out-Null

                docker run --rm --add-host=host.docker.internal:host-gateway `
                    -v "${frontend}:/app" `
                    -v "${backendForContracts}:/backend:ro" `
                    -v meta_frontend_node_modules:/app/node_modules `
                    -v "${frontendBrowserArtifacts}:/tmp/browser_e2e_artifacts" `
                    -v "${frontendBrowserPayloadArtifacts}:/tmp/browser_e2e_payload_artifacts" `
                    -e RETROBOLT_E2E_RUNTIME_CONTRACT_PATH=/backend/docs/generated/e2e_browser_runtime_plan/e2e_browser_runtime_plan_manifest.json `
                    -e RETROBOLT_PAGE_OBJECT_SELECTOR_CONTRACT_PATH=/backend/docs/generated/e2e_page_object_selector_contract/e2e_page_object_selector_contract_manifest.json `
                    -e RETROBOLT_E2E_PAYLOAD_CONTRACT_PATH=/backend/docs/generated/e2e_seeded_payload_contract/e2e_seeded_payload_contract_manifest.json `
                    -w /app node:20-bookworm-slim sh -lc "npm install && mkdir -p /tmp/browser_e2e_artifacts /tmp/browser_e2e_payload_artifacts && npx playwright install --with-deps chromium && RETROBOLT_RUN_BROWSER_E2E=1 RETROBOLT_FRONTEND_BASE_URL=http://host.docker.internal:5173 RETROBOLT_API_BASE_URL=http://host.docker.internal:8000 RETROBOLT_ADMIN_USERNAME=full-coverage-admin RETROBOLT_ADMIN_PASSWORD=admin-change-me RETROBOLT_E2E_ARTIFACT_DIR=/tmp/browser_e2e_artifacts RETROBOLT_E2E_PAYLOAD_ARTIFACT_DIR=/tmp/browser_e2e_payload_artifacts RETROBOLT_BROWSER_ENGINE=chromium npm run test:e2e:browser"
            }
        }
        finally { docker rm -f retrobolt_frontend_dev_e2e 2>$null | Out-Null }
    }

    Write-Host "`nFresh zero validation completed." -ForegroundColor Green
    Write-Host "Transcript: $logPath" -ForegroundColor Green
}
finally {
    Stop-Transcript | Out-Null
    Pop-Location
}
