import {
  assertLoadedPageObjectSelectorContract,
} from "./page-object-contract.mjs";

export function testIdSelector(testId) {
  return `[data-testid="${String(testId).replaceAll('"', '\\"')}"]`;
}

export function buildBrowserPageObjects(contract = assertLoadedPageObjectSelectorContract()) {
  const dbAdmin = contract.db_admin_base_test_ids;
  const workflows = contract.business_workflow_test_ids;
  return {
    dbAdminBase: {
      loginPage: testIdSelector(dbAdmin.login_page),
      loginForm: testIdSelector(dbAdmin.login_form),
      username: testIdSelector(dbAdmin.login_username),
      password: testIdSelector(dbAdmin.login_password),
      submit: testIdSelector(dbAdmin.login_submit),
      appShell: testIdSelector(dbAdmin.app_shell),
      sidebar: testIdSelector(dbAdmin.sidebar),
      main: testIdSelector(dbAdmin.main),
      workflowNav: testIdSelector(dbAdmin.workflow_nav),
      resourceNav: testIdSelector(dbAdmin.resource_nav),
      resourceFilter: testIdSelector(dbAdmin.resource_filter),
      refreshResources: testIdSelector(dbAdmin.refresh_resources),
      signOut: testIdSelector(dbAdmin.sign_out),
      resourcePage: testIdSelector(dbAdmin.resource_page),
      resourceCreate: testIdSelector(dbAdmin.resource_create),
      resourceRefresh: testIdSelector(dbAdmin.resource_refresh),
      resourceQuickSearch: testIdSelector(dbAdmin.resource_quick_search),
      resourcePageSize: testIdSelector(dbAdmin.resource_page_size),
    },
    businessWorkflows: {
      setupWorkbook: {
        nav: testIdSelector(workflows.setup_workbook.nav),
        page: testIdSelector(workflows.setup_workbook.page),
        templateButton: testIdSelector(workflows.setup_workbook.template_button),
        fileInput: testIdSelector(workflows.setup_workbook.file_input),
        dryRunButton: testIdSelector(workflows.setup_workbook.dry_run_button),
        previewButton: testIdSelector(workflows.setup_workbook.preview_button),
        auditStageButton: testIdSelector(workflows.setup_workbook.audit_stage_button),
        runtimeCommitButton: testIdSelector(workflows.setup_workbook.runtime_commit_button),
        reasonInput: testIdSelector(workflows.setup_workbook.reason_input),
        manifestCard: testIdSelector(workflows.setup_workbook.manifest_card),
        dryRunResult: testIdSelector(workflows.setup_workbook.dry_run_result),
        commitPlan: testIdSelector(workflows.setup_workbook.commit_plan),
        auditStageResult: testIdSelector(workflows.setup_workbook.audit_stage_result),
        runtimeCommitResult: testIdSelector(workflows.setup_workbook.runtime_commit_result),
      },
      matrixEditor: {
        nav: testIdSelector(workflows.matrix_editor.nav),
        page: testIdSelector(workflows.matrix_editor.page),
        domainSelect: testIdSelector(workflows.matrix_editor.domain_select),
        loadUniverseButton: testIdSelector(workflows.matrix_editor.load_universe_button),
        validateButton: testIdSelector(workflows.matrix_editor.validate_button),
        previewButton: testIdSelector(workflows.matrix_editor.preview_button),
        applyButton: testIdSelector(workflows.matrix_editor.apply_button),
      },
      auditView: {
        nav: testIdSelector(workflows.audit_view.nav),
        page: testIdSelector(workflows.audit_view.page),
      },
      resourceExposure: {
        nav: testIdSelector(workflows.resource_exposure.nav),
        page: testIdSelector(workflows.resource_exposure.page),
      },
      manualScoring: {
        nav: testIdSelector(workflows.manual_scoring.nav),
        page: testIdSelector(workflows.manual_scoring.page),
        reloadButton: testIdSelector(workflows.manual_scoring.reload_button),
        stateFilter: testIdSelector(workflows.manual_scoring.state_filter),
        queue: testIdSelector(workflows.manual_scoring.queue),
        scoreForm: testIdSelector(workflows.manual_scoring.score_form),
        submitButton: testIdSelector(workflows.manual_scoring.submit_button),
      },
    },
  };
}

