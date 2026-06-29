import type { AppointmentEntryGateState, Toast } from "../core/types.js";
import { el } from "../core/dom.js";
import { publicErrorMessage } from "../api/api.js";
import { configureAppointmentStudentEntryGate } from "../api/appointmentApi.js";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds.js";

export interface AppointmentEntryGateViewRuntime {
  state: AppointmentEntryGateState;
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

let runtime: AppointmentEntryGateViewRuntime;

export function renderAppointmentEntryGatePage(nextRuntime: AppointmentEntryGateViewRuntime): HTMLElement {
  runtime = nextRuntime;
  const state = runtime.state;

  const appointmentIdInput = el("input", {
    class: "input",
    type: "number",
    min: "1",
    inputmode: "numeric",
    value: state.appointmentId,
    placeholder: "123",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.appointmentId,
  }) as HTMLInputElement;
  appointmentIdInput.addEventListener("input", () => {
    state.appointmentId = appointmentIdInput.value;
  });

  const requiredCheckbox = el("input", {
    type: "checkbox",
    checked: state.passkeyRequired ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.requiredToggle,
  }) as HTMLInputElement;
  requiredCheckbox.addEventListener("change", () => {
    state.passkeyRequired = requiredCheckbox.checked;
    runtime.render();
  });

  const generateCheckbox = el("input", {
    type: "checkbox",
    checked: state.generateNewPasskey ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.generateToggle,
  }) as HTMLInputElement;
  generateCheckbox.addEventListener("change", () => {
    state.generateNewPasskey = generateCheckbox.checked;
    if (state.generateNewPasskey) {
      state.customPasskey = "";
    }
    runtime.render();
  });

  const customPasskeyInput = el("input", {
    class: "input",
    type: "text",
    value: state.customPasskey,
    disabled: state.generateNewPasskey ? true : null,
    placeholder: runtime.t("appointment_entry_gate_custom_passkey_placeholder"),
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.customPasskey,
  }) as HTMLInputElement;
  customPasskeyInput.addEventListener("input", () => {
    state.customPasskey = customPasskeyInput.value;
  });

  const submit = el("button", {
    class: "button primary",
    type: "button",
    disabled: state.loading ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.submitButton,
  }, [state.loading ? runtime.t("saving") : runtime.t("appointment_entry_gate_save")]);
  submit.addEventListener("click", () => {
    void submitStudentEntryGate();
  });

  const notices: Node[] = [];
  if (state.error) {
    notices.push(el("div", { class: "error" }, [state.error]));
  }
  if (state.result) {
    const generated = state.result.generated_passkey
      ? el("div", { class: "notice strong", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.generatedPasskey }, [
        runtime.t("appointment_entry_gate_generated_passkey"),
        " ",
        state.result.generated_passkey,
      ])
      : null;
    notices.push(el("div", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.result }, [
      el("div", { class: "card__body stack" }, [
        el("div", {}, [runtime.t("appointment_entry_gate_result_appointment"), ": ", String(state.result.appointment_id ?? "")]),
        el("div", {}, [runtime.t("appointment_entry_gate_result_required"), ": ", state.result.passkey_required ? runtime.t("yes") : runtime.t("no")]),
        el("div", {}, [runtime.t("appointment_entry_gate_result_configured"), ": ", state.result.passkey_configured ? runtime.t("yes") : runtime.t("no")]),
        generated,
        el("p", { class: "page-subtitle" }, [runtime.t("appointment_entry_gate_distribution_help")]),
      ]),
    ]));
  }

  return el("section", { class: "stack", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.appointmentEntryGate.page }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [runtime.t("appointment_entry_gate_title")]),
        el("p", { class: "page-subtitle" }, [runtime.t("appointment_entry_gate_subtitle")]),
      ]),
    ]),
    ...notices,
    el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        field(runtime.t("appointment_entry_gate_appointment_id"), appointmentIdInput),
        checkboxField(requiredCheckbox, runtime.t("appointment_entry_gate_required"), runtime.t("appointment_entry_gate_required_help")),
        checkboxField(generateCheckbox, runtime.t("appointment_entry_gate_generate"), runtime.t("appointment_entry_gate_generate_help")),
        field(runtime.t("appointment_entry_gate_custom_passkey"), customPasskeyInput, runtime.t("appointment_entry_gate_custom_passkey_help")),
        el("div", { class: "toolbar" }, [submit]),
      ]),
    ]),
  ]);
}

function field(label: string, control: HTMLElement, help?: string): HTMLElement {
  const children: Array<Node | string> = [el("span", {}, [label]), control];
  if (help) {
    children.push(el("small", { class: "help-text" }, [help]));
  }
  return el("label", { class: "field" }, children);
}

function checkboxField(control: HTMLInputElement, label: string, help: string): HTMLElement {
  return el("label", { class: "field checkbox-field" }, [
    el("span", { class: "inline" }, [control, " ", label]),
    el("small", { class: "help-text" }, [help]),
  ]);
}

async function submitStudentEntryGate(): Promise<void> {
  const state = runtime.state;
  const appointmentId = Number(state.appointmentId);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    state.error = runtime.t("appointment_entry_gate_appointment_required");
    runtime.render();
    return;
  }
  state.loading = true;
  state.error = null;
  state.result = null;
  runtime.render();
  try {
    const input = {
      appointment_id: appointmentId,
      passkey_required: state.passkeyRequired,
      generate_new_passkey: state.generateNewPasskey,
    } as { appointment_id: number; passkey_required: boolean; generate_new_passkey: boolean; passkey?: string };
    const customPasskey = state.customPasskey.trim();
    if (customPasskey) {
      input.passkey = customPasskey;
    }
    const response = await configureAppointmentStudentEntryGate(input);
    state.result = {
      appointment_id: response.appointment.id,
      passkey_required: response.passkey_required,
      passkey_configured: response.passkey_configured,
      generated_passkey: response.generated_passkey ?? null,
      distribution: response.distribution,
    };
    state.customPasskey = "";
    state.generateNewPasskey = false;
    runtime.notify("success", runtime.t("appointment_entry_gate_saved"));
  } catch (error) {
    state.error = publicErrorMessage(error, runtime.t("appointment_entry_gate_save_failed"));
  } finally {
    state.loading = false;
    runtime.render();
  }
}
