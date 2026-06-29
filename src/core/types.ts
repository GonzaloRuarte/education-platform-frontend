export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type RecordValue = JsonValue | undefined;
export type ResourceRecord = Record<string, RecordValue>;
export type Locale = "en" | "es";
export type ThemeMode = "light" | "dark";
export type LocalizedText = Partial<Record<Locale | string, string>>;
export type FieldI18n = {
  label?: LocalizedText;
  help_text?: LocalizedText;
  ui?: {
    section?: LocalizedText;
    placeholder?: LocalizedText;
  };
};
export type ResourceI18n = {
  label?: LocalizedText;
  plural_label?: LocalizedText;
};
export type ActionI18n = {
  label?: LocalizedText;
  message?: LocalizedText;
};

export type FieldType =
  | "string"
  | "text"
  | "rich_text"
  | "integer"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "enum"
  | "foreign_key"
  | "many_to_many"
  | "json";

export type ResourceAction = "list" | "retrieve" | "create" | "update" | "delete" | "batch_delete";
export type ResourceActions = Partial<Record<ResourceAction, boolean>>;
export type WorkflowPage = "setup_workbook" | "matrix_editor" | "audit_view" | "manual_scoring" | "appointment_entry_gate";

export type StaticOption = {
  value: string;
  label: string;
  i18n?: { label?: LocalizedText };
};

export type OptionSource = {
  kind: "static";
  options: StaticOption[];
};

export type RelationDefinition = {
  depends_on: string[];
  dependencies?: Array<{ source_field: string; target_field: string; operator: string }>;
  priority?: number | null;
  page_size?: number;
  option_control?: "select" | "typeahead" | string;
};

export type AdminControl =
  | "text_input"
  | "textarea"
  | "number_input"
  | "checkbox"
  | "date_input"
  | "datetime_input"
  | "email_input"
  | "enum_select"
  | "fk_select"
  | "many_to_many_select"
  | "json_textarea"
  | "read_only";

export type FieldValidation = {
  max_length?: number;
  min_length?: number;
  max_value?: number | string;
  min_value?: number | string;
  max_digits?: number;
  decimal_places?: number;
  step?: number | string;
  pattern?: string;
  format?: string;
  choices?: string[];
  required?: boolean;
  nullable?: boolean;
  allow_blank?: boolean;
};

export type FieldUi = {
  section?: string;
  priority?: number;
  width?: "full" | "half" | "third" | string;
  placeholder?: string;
};

export type ResourceField = {
  key: string;
  alias?: string;
  label?: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  editable: boolean;
  readonly_on_update: boolean;
  visible_in_list: boolean;
  sortable: boolean;
  filterable: boolean;
  pii: boolean;
  write_only: boolean;
  help_text?: string;
  admin_control?: AdminControl | null;
  validation?: FieldValidation;
  ui?: FieldUi;
  i18n?: FieldI18n;
  option_source?: OptionSource;
  relation?: RelationDefinition;
  filter?: { operators?: FilterOperatorDefinition[] };
};

export type DestructiveAction = {
  confirm?: boolean;
  tone?: "danger" | "warning" | "neutral" | string;
  label?: string;
  message?: string;
  i18n?: ActionI18n;
};

export type ResourceNavigation = {
  group?: string;
  order?: number;
};

export type RelatedListDefinition = {
  alias: string;
  label?: string;
  target_resource_alias: string;
  target_field: string;
  source_field: string;
  operator: string;
  i18n?: { label?: LocalizedText };
};

export type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

export type GridFilterItem = {
  field: string;
  operator: string;
  value?: JsonValue;
};

export type GridFilterModel = {
  items: GridFilterItem[];
  quickFilterValues: string[];
  linkOperator: "and" | "or";
};

export type FilterValueControl = {
  kind?: "field" | "none" | string;
  multiple?: boolean;
};

export type FilterOperatorDefinition = {
  key: string;
  label: string;
  value_kind: "single" | "multiple" | "none" | string;
  field_types?: string[];
  value_control?: FilterValueControl;
  i18n?: { label?: LocalizedText };
};

export type FilterControlReader = {
  element: HTMLElement;
  readValue: () => JsonValue | undefined;
  reset: () => void;
};

export type ResourceSchema = {
  key: string;
  alias?: string;
  label?: string;
  plural_label?: string;
  fields: ResourceField[];
  page_size: number;
  destructive_actions?: Record<string, DestructiveAction>;
  actions?: ResourceActions;
  navigation?: ResourceNavigation;
  i18n?: ResourceI18n;
  related_lists?: RelatedListDefinition[];
};

export type ResourceDiscoveryItem = {
  alias: string;
  i18n?: ResourceI18n;
};

export type ResourcesResponse = {
  resources: ResourceDiscoveryItem[];
};

export type PaginatedRecords = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ResourceRecord[];
};

export type RelationOption = {
  value: string | number;
  label: string;
};

export type OptionsResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  options: RelationOption[];
};

export type TokenPair = {
  access: string;
  refresh: string;
};

export type StudentExamAccessToken = {
  access: string;
  token_type: "StudentExam";
  expires_at: string;
};

export type AuthUser = {
  username: string;
  first_name?: string;
  last_name?: string;
};

export type AppAuthSession = {
  kind?: "app_user";
  token: TokenPair;
  user: AuthUser;
};

export type StudentExamAuthSession = {
  kind: "student_exam_access_session";
  token: StudentExamAccessToken;
  student: {
    personal_id: string;
    student_profile_id: number;
    appointment_id: number;
    institution_id: number;
  };
  requires_app_user: false;
  requires_role_grant: false;
};

export type AuthSession = AppAuthSession | StudentExamAuthSession;

export type AppState = {
  resources: ResourceSchema[];
  selectedResourceKey: string | null;
  selectedWorkflow: WorkflowPage | null;
  resourceFilter: string;
  collapsedResourceGroups: Set<string>;
  resourceView: ResourceViewState | null;
  setupWorkbook: SetupWorkbookState;
  matrixEditor: MatrixEditorState;
  auditView: AuditViewState;
  manualScoring: ManualScoringState;
  appointmentEntryGate: AppointmentEntryGateState;
  loading: boolean;
  error: string | null;
  message: string | null;
  locale: Locale;
  theme: ThemeMode;
  toasts: Toast[];
  dbAdminAccessDenied: boolean;
};

export type ResourceViewState = {
  schema: ResourceSchema;
  records: ResourceRecord[];
  count: number;
  page: number;
  pageSize: number;
  quickSearch: string;
  filterModel: GridFilterModel;
  sortField: string;
  sortDirection: "asc" | "desc";
  optionMaps: Record<string, Map<string, string>>;
  selectedIdentities: Set<string>;
  loading: boolean;
  error: string | null;
};

export type SetupWorkbookColumnManifest = {
  key: string;
  label?: string;
  required?: boolean;
  help_text?: string;
  allowed_values?: string[];
  example?: string;
  lookup?: boolean;
  resource_field_key?: string;
  template_source?: string;
};

export type SetupWorkbookSheetManifest = {
  key: string;
  title?: string;
  resource_key?: string;
  description?: string;
  columns?: SetupWorkbookColumnManifest[];
};

export type SetupWorkbookContextSelectorManifest = {
  resource_key?: string;
  resource_alias?: string;
  context_field?: "organization_id" | "institution_id" | string;
  value_field?: string;
  value_field_alias?: string;
  label_field?: string;
  label_field_alias?: string;
  filters?: GridFilterModel;
  help_text?: string;
  api_boundary?: string;
};

export type SetupWorkbookManifest = {
  stage?: string;
  sheets?: SetupWorkbookSheetManifest[];
  context_selector?: SetupWorkbookContextSelectorManifest | null;
  workflows?: Record<string, unknown>;
  import?: Record<string, unknown>;
};

export type SetupWorkbookContextOption = {
  value: string;
  label: string;
};

export type SetupWorkbookWizardDiscoveryStatus = "idle" | "loading" | "ready" | "unavailable" | "error";

export type SetupWorkbookWizardState = {
  enabled: boolean;
  discoveryStatus: SetupWorkbookWizardDiscoveryStatus;
  discoveryError: string | null;
  organizationOptionCount: number | null;
  institutionOptionCount: number | null;
  organizationAutoSelected: boolean;
  institutionAutoSelected: boolean;
  organizationCommittedAt: string | null;
  institutionCommittedAt: string | null;
  organizationAuditBatchId: string | number | null;
  institutionAuditBatchId: string | number | null;
};

export type SetupWorkbookIssue = {
  severity?: "error" | "warning" | string;
  code: string;
  sheet?: string;
  row?: number;
  column?: string;
  value?: JsonValue;
  message: string;
  omittable?: boolean;
  requires_confirmation?: boolean;
};

export type SetupWorkbookStagedRow = {
  row_number: number;
  operation?: string;
  values?: Record<string, JsonValue>;
  corrected_values?: Record<string, JsonValue>;
};

export type SetupWorkbookCellCorrection = {
  sheet: string;
  row_number: number;
  column: string;
  value: JsonValue;
};

export type SetupWorkbookSheetResult = {
  sheet: string;
  title?: string;
  resource_key?: string;
  rows?: SetupWorkbookStagedRow[];
};

export type SetupWorkbookDryRunResult = {
  status: "valid" | "invalid" | string;
  committed?: boolean;
  writes_performed?: boolean;
  summary?: Record<string, JsonValue>;
  sheets?: SetupWorkbookSheetResult[];
  errors?: SetupWorkbookIssue[];
  warnings?: SetupWorkbookIssue[];
  omittable_warning_codes?: string[];
  confirmable_warning_codes?: string[];
};

export type SetupWorkbookCommitOperation = {
  sequence: number;
  sheet?: string;
  row_number?: number | null;
  resource_key?: string;
  action?: string;
  status?: string;
  record_identity?: string;
  before?: Record<string, JsonValue>;
  after?: Record<string, JsonValue>;
  warnings?: SetupWorkbookIssue[];
  errors?: SetupWorkbookIssue[];
  requires_confirmation?: boolean;
  skip_reason?: string;
};

export type SetupWorkbookCommitPlan = {
  status: "ready" | "blocked" | string;
  commit_allowed?: boolean;
  business_writes_performed?: boolean;
  requires_transaction?: boolean;
  requires_audit_batch_before_writes?: boolean;
  summary?: Record<string, JsonValue>;
  rejected_reasons?: Array<{ code?: string; message?: string; [key: string]: unknown }>;
  warnings?: SetupWorkbookIssue[];
  operations?: SetupWorkbookCommitOperation[];
};

export type SetupWorkbookAuditStageResult = {
  version?: number;
  source?: string;
  business_writes_performed?: boolean;
  audit_batch_created?: boolean;
  audit_batch_id?: number | null;
  audit_batch_status?: string;
  operation_count?: number;
  commit_allowed?: boolean;
  [key: string]: JsonValue | undefined;
};


export type SetupWorkbookRuntimeCommitResult = {
  source?: string;
  business_writes_performed?: boolean;
  transactional?: boolean;
  audit_batch_id?: number | null;
  audit_batch_status?: string;
  applied_operation_count?: number;
  skipped_operation_count?: number;
  default_writers_used?: boolean;
  writer_coverage_preflight?: Record<string, JsonValue>;
  [key: string]: JsonValue | undefined;
};

export type SetupWorkbookStageSlug = "organization" | "institution";

export type SetupWorkbookState = {
  selectedStage: SetupWorkbookStageSlug;
  organizationContextId: string;
  institutionContextId: string;
  contextOptions: SetupWorkbookContextOption[];
  contextOptionsLoading: boolean;
  contextOptionsError: string | null;
  wizard: SetupWorkbookWizardState;
  manifest: SetupWorkbookManifest | null;
  selectedFile: File | null;
  dryRunResult: SetupWorkbookDryRunResult | null;
  commitPlan: SetupWorkbookCommitPlan | null;
  auditStageResult: SetupWorkbookAuditStageResult | null;
  runtimeCommitResult: SetupWorkbookRuntimeCommitResult | null;
  omittedRows: Set<string>;
  confirmedWarningCodes: Set<string>;
  cellCorrections: Map<string, SetupWorkbookCellCorrection>;
  reason: string;
  loading: boolean;
  error: string | null;
};

export type MatrixEditorDomain = "organization" | "institution";

export type MatrixEditorUniverseResource = {
  resource_key: string;
  alias?: string;
  label?: string;
  structured_editor_only?: boolean;
  actions?: Partial<Record<ResourceAction, boolean>>;
};

export type MatrixEditorColumnGrantColumn = {
  key: string;
  alias?: string;
  label?: string;
  type?: string;
  pii?: boolean;
  write_only?: boolean;
};

export type MatrixEditorColumnGrantAction = {
  action: string;
  row_scope_type?: string | null;
  columns?: MatrixEditorColumnGrantColumn[];
};

export type MatrixEditorColumnGrantResource = {
  resource_key: string;
  alias?: string;
  label?: string;
  structured_editor_only?: boolean;
  actions?: MatrixEditorColumnGrantAction[];
};

export type MatrixEditorRowScopeType = {
  key: string;
  label?: string;
  description?: string;
  domain?: string;
  customer_configurable?: boolean;
  resource_key?: string;
  action?: string;
  [key: string]: JsonValue | undefined;
};


export type MatrixEditorPermissionBundle = {
  key: string;
  label?: LocalizedText;
  description?: LocalizedText;
  resources?: string[];
  actions?: string[];
  api_entrypoints?: string[];
  scope_hint?: string | null;
};

export type MatrixEditorUserTypePreset = {
  key: string;
  name: string;
  description?: string;
  resource_key: string;
  target: "organization" | "institution" | "institution_template";
  permission_bundle_keys?: string[];
  scope_hint?: string | null;
};

export type MatrixEditorUniverse = {
  version?: number;
  domain: MatrixEditorDomain;
  api_name?: string;
  principal?: string;
  resources?: MatrixEditorUniverseResource[];
  role_type_bindings?: Record<string, JsonValue>;
  row_scope_types?: MatrixEditorRowScopeType[];
  column_grant_universe?: MatrixEditorColumnGrantResource[];
  permission_bundles?: MatrixEditorPermissionBundle[];
  role_type_presets?: MatrixEditorUserTypePreset[];
  forbidden_customer_features?: string[];
  role_mutation_status?: string;
  target_role_grant_editor?: Record<string, JsonValue>;
};

export type MatrixEditorIssue = {
  path?: string;
  message: string;
};

export type MatrixEditorValidationResponse = {
  valid?: boolean;
  domain?: string;
  principal?: string;
  errors?: MatrixEditorIssue[];
  warnings?: MatrixEditorIssue[];
  mutation_status?: string;
};

export type MatrixEditorPreviewResponse = {
  valid?: boolean;
  domain?: string;
  principal?: string;
  validation?: MatrixEditorValidationResponse;
  row_scope_value_preview?: JsonValue;
  column_grant_preview?: JsonValue;
  would_commit?: boolean;
  mutation_status?: string;
};

export type MatrixEditorApplyResponse = {
  valid?: boolean;
  committed?: boolean;
  batch_id?: number | string;
  applied_count?: number;
  deferred_count?: number;
  mutation_status?: string;
  [key: string]: JsonValue | undefined;
};

export type MatrixEditorResourceProposal = {
  resource_key: string;
  action: "create" | "update";
  record_identity?: string;
  after: Record<string, JsonValue>;
};

export type MatrixEditorRowScopeValueProposal = {
  row_scope_type: string;
  values: Array<string | number | boolean>;
};

export type MatrixEditorColumnGrantProposal = {
  resource_key: string;
  action: string;
  columns: string[];
};

export type MatrixEditorRoleGrantProposal = {
  action: "create" | "update" | "revoke";
  record_identity?: string;
  after?: Record<string, JsonValue>;
  before?: Record<string, JsonValue>;
};

export type MatrixEditorRoleGrantForm = {
  action: "create" | "update" | "revoke";
  record_identity: string;
  user: string;
  role: string;
  organization: string;
  institution: string;
  status: string;
  starts_on: string;
  ends_on: string;
  grant_reason: string;
  support_reason: string;
  scope_target: string;
  scope_ids: string;
  error: string | null;
};

export type MatrixEditorProposalBody = {
  resources?: MatrixEditorResourceProposal[];
  api_entrypoints?: string[];
  row_scope_values?: MatrixEditorRowScopeValueProposal[];
  column_grants?: MatrixEditorColumnGrantProposal[];
  role_grants?: MatrixEditorRoleGrantProposal[];
};

export type MatrixEditorPayload = {
  domain: MatrixEditorDomain;
  proposal: MatrixEditorProposalBody;
  reason?: string;
};

export type MatrixEditorResourceDraft = {
  resource_key: string;
  action: "create" | "update";
  record_identity: string;
  after_json: string;
  error: string | null;
};

export type MatrixEditorState = {
  domain: MatrixEditorDomain;
  universeByDomain: Partial<Record<MatrixEditorDomain, MatrixEditorUniverse>>;
  resourceDraft: MatrixEditorResourceDraft;
  resourceProposals: MatrixEditorResourceProposal[];
  apiEntrypointDraft: string;
  apiEntrypoints: string[];
  roleGrantDraft: string;
  roleGrantForm: MatrixEditorRoleGrantForm;
  roleGrantProposals: MatrixEditorRoleGrantProposal[];
  rowScopeValues: Map<string, string>;
  columnGrantSelections: Map<string, Set<string>>;
  validation: MatrixEditorValidationResponse | null;
  preview: MatrixEditorPreviewResponse | null;
  applyResult: MatrixEditorApplyResponse | null;
  reason: string;
  confirmDangerous: boolean;
  loading: boolean;
  error: string | null;
};

export type AuditViewKind = "batches" | "events";

export type AuditRecord = Record<string, JsonValue | undefined> & {
  id?: string | number;
  created_at?: string | null;
  occurred_at?: string | null;
  actor_username?: string;
  domain?: string;
  source?: string;
  status?: string;
  event_type?: string;
  operation_count?: number | null;
  request_id?: string;
  reason?: string;
  resource_key?: string;
  action?: string;
};

export type AuditListResponse = {
  api_entrypoint?: string;
  domain?: string;
  scope?: Record<string, JsonValue>;
  limit?: number;
  offset?: number;
  count?: number;
  results?: AuditRecord[];
};

export type AuditDetailResponse = {
  api_entrypoint?: string;
  domain?: string;
  scope?: Record<string, JsonValue>;
  result?: AuditRecord;
};

export type AuditViewFilters = {
  status: string;
  source: string;
  domain: string;
  eventType: string;
  limit: string;
  offset: string;
};

export type AuditViewState = {
  kind: AuditViewKind;
  filters: AuditViewFilters;
  list: AuditListResponse | null;
  detail: AuditDetailResponse | null;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

export type ManualScoringStateKey = "manual_scoring_pending" | "auto_scored" | "manual_override" | "manually_scored";

export type ManualScoringRubric = {
  title?: string;
  description?: string;
  max_score?: number | null;
};

export type ManualScoringTextAnnotation = {
  id?: number;
  anchor_start: number;
  anchor_end: number;
  anchor_quote?: string;
  comment: string;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ManualScoringQueueRow = {
  question_resolution_id: number;
  scoring_state: ManualScoringStateKey | string;
  answer_type: "OpenEnded" | "Numeric" | "MultipleChoice" | string;
  is_right: boolean;
  manual_is_right?: boolean | null;
  manual_score?: number | null;
  manual_score_max?: number | null;
  manual_scored_at?: string | null;
  manual_score_reason?: string;
  reportable_scored?: boolean;
  evaluation_resolution_id?: number;
  appointment?: { id?: number; begins_at?: string | null; ends_at?: string | null; operational_status?: string } | null;
  student?: { id?: number; personal_id?: string | null; institution?: { id?: number; name?: string } };
  question?: { id?: number; content?: string; skill?: string | null; difficulty?: number | null };
  rubric?: ManualScoringRubric;
  submitted_value?: Record<string, JsonValue>;
  annotations?: ManualScoringTextAnnotation[];
};

export type ManualScoringQueueResponse = {
  scoring_state: ManualScoringStateKey | string;
  limit: number;
  offset: number;
  count: number;
  results: ManualScoringQueueRow[];
};

export type ManualScoringState = {
  scoringState: ManualScoringStateKey;
  queue: ManualScoringQueueResponse | null;
  selectedQuestionResolutionId: number | null;
  isRight: string;
  manualScore: string;
  manualScoreMax: string;
  reason: string;
  loading: boolean;
  error: string | null;
};

export type AppointmentEntryGateState = {
  appointmentId: string;
  passkeyRequired: boolean;
  generateNewPasskey: boolean;
  customPasskey: string;
  loading: boolean;
  error: string | null;
  result: {
    appointment_id?: number;
    passkey_required?: boolean;
    passkey_configured?: boolean;
    generated_passkey?: string | null;
    distribution?: string;
  } | null;
};

export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  request_id?: string;
  [key: string]: unknown;
};

