export type FormFieldType = "text" | "email" | "tel" | "textarea" | "select" | "checkbox";

export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

export type FormValues = Record<string, string | boolean>;

export type SubmissionStatus = "pending" | "failed" | "sent";

export type OfflineSubmission = {
  id: string;
  fields: FormValues;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  attempts: number;
  lastError?: string;
};

export type QueueStats = {
  pending: number;
  failed: number;
  sent: number;
};
