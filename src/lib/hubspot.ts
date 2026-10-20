import { FORM_FIELDS } from "../formConfig";
import type { FormValues } from "../types";

const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
const formId = import.meta.env.VITE_HUBSPOT_FORM_ID;
const allowedFieldNames = new Set(FORM_FIELDS.map((field) => field.name));

type HubSpotField = {
  name: string;
  value: string;
};

const hiddenTrackingFields: HubSpotField[] = [
  { name: "utm_campaign", value: "Eventos" },
  { name: "utm_content", value: "form_offline" },
];

type HubSpotContext = {
  pageUri: string;
  pageName: string;
};

const getHubSpotEndpoint = () => {
  if (!portalId || !formId) {
    throw new Error("Faltan VITE_HUBSPOT_PORTAL_ID o VITE_HUBSPOT_FORM_ID.");
  }

  return `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
};

const toHubSpotFields = (values: FormValues): HubSpotField[] => {
  const visibleFields = Object.entries(values)
    .filter(
      ([name, value]) =>
        allowedFieldNames.has(name) && value !== "" && value !== false && value !== undefined && value !== null,
    )
    .map(([name, value]) => ({
      name,
      value: typeof value === "boolean" ? String(value) : value,
    }));

  return [...visibleFields, ...hiddenTrackingFields];
};

const getHubSpotContext = (): HubSpotContext => {
  return {
    pageUri: window.location.href,
    pageName: document.title,
  };
};

export const submitToHubSpot = async (values: FormValues): Promise<void> => {
  const response = await fetch(getHubSpotEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: toHubSpotFields(values),
      context: getHubSpotContext(),
    }),
  });

  if (response.ok) return;

  let message = `HubSpot respondio con estado ${response.status}.`;
  try {
    const body = (await response.json()) as { message?: string; errors?: Array<{ message?: string }> };
    message = body.message ?? body.errors?.[0]?.message ?? message;
  } catch {
    // HubSpot can return non-JSON errors in edge cases.
  }

  throw new Error(message);
};
