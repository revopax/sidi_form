import { FORM_FIELDS } from "../formConfig";
import type { FormValues } from "../types";

const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
const formId = import.meta.env.VITE_HUBSPOT_FORM_ID;
const allowedFieldNames = new Set(FORM_FIELDS.map((field) => field.name));

type HubSpotField = {
  name: string;
  value: string;
};

type HubSpotContext = {
  pageUri: string;
  pageName: string;
  hutk?: string;
};

const getHubSpotEndpoint = () => {
  if (!portalId || !formId) {
    throw new Error("Faltan VITE_HUBSPOT_PORTAL_ID o VITE_HUBSPOT_FORM_ID.");
  }

  return `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
};

const toHubSpotFields = (values: FormValues): HubSpotField[] =>
  Object.entries(values)
    .filter(
      ([name, value]) =>
        allowedFieldNames.has(name) && value !== "" && value !== false && value !== undefined && value !== null,
    )
    .map(([name, value]) => ({
      name,
      value: typeof value === "boolean" ? String(value) : value,
    }));

const getCookieValue = (name: string): string | undefined => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));

  return cookie?.split("=")[1] ? decodeURIComponent(cookie.split("=")[1]) : undefined;
};

const getHubSpotContext = (): HubSpotContext => {
  const hutk = getCookieValue("hubspotutk");

  return {
    pageUri: window.location.href,
    pageName: document.title,
    ...(hutk ? { hutk } : {}),
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
