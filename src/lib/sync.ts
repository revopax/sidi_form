import { getPendingSubmissions, markSubmissionFailed, markSubmissionSent } from "./offlineQueue";
import { submitToHubSpot } from "./hubspot";

export type SyncResult = {
  attempted: number;
  sent: number;
  failed: number;
};

let syncInProgress: Promise<SyncResult> | null = null;

export const syncPendingSubmissions = async (): Promise<SyncResult> => {
  if (syncInProgress) return syncInProgress;

  syncInProgress = runSync().finally(() => {
    syncInProgress = null;
  });

  return syncInProgress;
};

const runSync = async (): Promise<SyncResult> => {
  if (!navigator.onLine) {
    return { attempted: 0, sent: 0, failed: 0 };
  }

  const submissions = await getPendingSubmissions();
  const result: SyncResult = { attempted: submissions.length, sent: 0, failed: 0 };

  for (const submission of submissions) {
    try {
      await submitToHubSpot(submission.fields);
      await markSubmissionSent(submission.id);
      result.sent += 1;
    } catch (error) {
      console.error("No se pudo enviar el registro a HubSpot.", submission.id, error);
      await markSubmissionFailed(
        submission.id,
        error instanceof Error ? error.message : "Error desconocido al sincronizar.",
      );
      result.failed += 1;
    }
  }

  return result;
};
