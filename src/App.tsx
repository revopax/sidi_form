import { FormEvent, useEffect, useState } from "react";
import { FORM_DESCRIPTION, FORM_FIELDS } from "./formConfig";
import { isCorporateEmail } from "./lib/emailValidation";
import { createSubmission } from "./lib/offlineQueue";
import { syncPendingSubmissions } from "./lib/sync";
import type { FormFieldConfig, FormValues } from "./types";
import "./styles.css";

const initialValues = FORM_FIELDS.reduce<FormValues>((values, field) => {
  values[field.name] = field.type === "checkbox" ? false : "";
  return values;
}, {});

type FormErrors = Record<string, string>;

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  for (const field of FORM_FIELDS) {
    const value = values[field.name];
    const emptyText = typeof value === "string" && value.trim() === "";

    if (field.required && (value === false || value === undefined || value === null || emptyText)) {
      errors[field.name] = "Este campo es obligatorio.";
      continue;
    }

    if (field.type === "email" && typeof value === "string" && value.trim() !== "") {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!validEmail) errors[field.name] = "Ingresa un correo válido.";
      else if (!isCorporateEmail(value)) errors[field.name] = "Ingresa un correo corporativo.";
    }
  }

  return errors;
};

const normalizeValues = (values: FormValues): FormValues =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  );

function App() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const runSilentSync = () => {
    syncPendingSubmissions().catch((error) => {
      console.warn("No se pudieron sincronizar registros pendientes.", error);
    });
  };

  useEffect(() => {
    runSilentSync();

    const handleOnline = () => runSilentSync();
    const syncInterval = window.setInterval(runSilentSync, 60_000);
    window.addEventListener("online", handleOnline);

    return () => {
      window.clearInterval(syncInterval);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const updateValue = (field: FormFieldConfig, value: string | boolean) => {
    setValues((current) => ({ ...current, [field.name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field.name];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = normalizeValues(values);
    const nextErrors = validate(nextValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage("Revisa los campos marcados.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubmission(nextValues);
      setValues(initialValues);
      setMessage("Gracias. Recibimos tu información.");

      if (navigator.onLine) runSilentSync();
    } catch {
      setMessage("No pudimos guardar tu registro. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="intro-panel">
        <div className="intro-copy">
          <h1>
            Platiquemos sobre las <span>necesidades</span> de tu proyecto
          </h1>
          <div className="accent-line" aria-hidden="true" />
          <p className="description">{FORM_DESCRIPTION}</p>
          <p className="phone-copy">
            Llámanos:
            <br />
            <a href="tel:+525597710661">+52 55 9771 0661</a>
          </p>
        </div>
      </section>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {FORM_FIELDS.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(value) => updateValue(field, value)}
          />
        ))}

        <p className="required-note">* Campo obligatorio</p>

        <div className="actions">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>

        <p className="form-message" role="status">
          {message}
        </p>
      </form>
    </main>
  );
}

type FieldProps = {
  field: FormFieldConfig;
  value: string | boolean;
  error?: string;
  onChange: (value: string | boolean) => void;
};

function Field({ field, value, error, onChange }: FieldProps) {
  const inputId = `field-${field.name}`;

  if (field.type === "checkbox") {
    return (
      <div className="field checkbox-field">
        <label htmlFor={inputId}>
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span>
            {field.label}
            {field.required ? " *" : ""}
          </span>
        </label>
        {error ? <p className="error">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="field">
        <label htmlFor={inputId}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <textarea
          id={inputId}
          name={field.name}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error ? <p className="error">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="field">
        <label htmlFor={inputId}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        <select
          id={inputId}
          name={field.name}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
        >
          <option value="">Selecciona una opcion</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <p className="error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="field">
      <label htmlFor={inputId}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      <input
        id={inputId}
        name={field.name}
        type={field.type}
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}

export default App;
