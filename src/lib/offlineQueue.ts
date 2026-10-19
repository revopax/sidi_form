import { openDB, type DBSchema } from "idb";
import type { FormValues, OfflineSubmission, QueueStats } from "../types";

const DB_NAME = "sidi-formulario-offline";
const DB_VERSION = 1;
const STORE_NAME = "submissions";

interface OfflineQueueDb extends DBSchema {
  submissions: {
    key: string;
    value: OfflineSubmission;
    indexes: {
      "by-status": OfflineSubmission["status"];
      "by-created-at": string;
    };
  };
}

const getDb = () =>
  openDB<OfflineQueueDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("by-status", "status");
      store.createIndex("by-created-at", "createdAt");
    },
  });

export const createSubmission = async (fields: FormValues): Promise<OfflineSubmission> => {
  const now = new Date().toISOString();
  const submission: OfflineSubmission = {
    id: crypto.randomUUID(),
    fields,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    attempts: 0,
  };

  const db = await getDb();
  await db.put(STORE_NAME, submission);
  return submission;
};

export const getPendingSubmissions = async (): Promise<OfflineSubmission[]> => {
  const db = await getDb();
  const pending = await db.getAllFromIndex(STORE_NAME, "by-status", "pending");
  const failed = await db.getAllFromIndex(STORE_NAME, "by-status", "failed");

  return [...pending, ...failed].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

export const markSubmissionSent = async (id: string): Promise<void> => {
  const db = await getDb();
  const submission = await db.get(STORE_NAME, id);
  if (!submission) return;

  const now = new Date().toISOString();
  await db.put(STORE_NAME, {
    ...submission,
    fields: {},
    status: "sent",
    sentAt: now,
    updatedAt: now,
    lastError: undefined,
  });
};

export const markSubmissionFailed = async (id: string, error: string): Promise<void> => {
  const db = await getDb();
  const submission = await db.get(STORE_NAME, id);
  if (!submission) return;

  await db.put(STORE_NAME, {
    ...submission,
    status: "failed",
    attempts: submission.attempts + 1,
    lastError: error,
    updatedAt: new Date().toISOString(),
  });
};

export const getQueueStats = async (): Promise<QueueStats> => {
  const db = await getDb();
  const [pending, failed, sent] = await Promise.all([
    db.countFromIndex(STORE_NAME, "by-status", "pending"),
    db.countFromIndex(STORE_NAME, "by-status", "failed"),
    db.countFromIndex(STORE_NAME, "by-status", "sent"),
  ]);

  return { pending, failed, sent };
};
