import type { FormFieldConfig } from "./types";

export const FORM_TITLE = "Platiquemos sobre las necesidades de tu proyecto";
export const FORM_DESCRIPTION =
  "Completa el formulario y uno de nuestros especialistas se pondrá en contacto contigo a la brevedad.";

// Ajusta los `name` para que coincidan exactamente con los nombres internos del formulario de HubSpot.
export const FORM_FIELDS: FormFieldConfig[] = [
  {
    name: "firstname",
    label: "Nombre",
    type: "text",
    required: true,
  },
  {
    name: "lastname",
    label: "Apellidos",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Correo corporativo",
    type: "email",
    required: true,
  },
  {
    name: "hs_whatsapp_phone_number",
    label: "Número de WhatsApp",
    type: "tel",
    required: true,
  },
];
