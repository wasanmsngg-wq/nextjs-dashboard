"use client";

import {
  WORKOUT_QUEUE_DATABASE,
  WORKOUT_QUEUE_STORE,
  type WorkoutMutation,
} from "@/app/domain";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB)
      return reject(new Error("Offline storage is unavailable."));
    const request = indexedDB.open(WORKOUT_QUEUE_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(WORKOUT_QUEUE_STORE))
        database.createObjectStore(WORKOUT_QUEUE_STORE, {
          keyPath: "mutationId",
        });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Offline storage could not be opened."));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, resolve: (value: T) => void) => void,
) {
  const database = await openDatabase();
  return await new Promise<T>((resolve, reject) => {
    const tx = database.transaction(WORKOUT_QUEUE_STORE, mode);
    tx.onerror = () => reject(new Error("Offline storage operation failed."));
    tx.oncomplete = () => database.close();
    run(tx.objectStore(WORKOUT_QUEUE_STORE), resolve);
  });
}

export async function enqueueWorkoutMutation(mutation: WorkoutMutation) {
  await transaction<void>("readwrite", (store, resolve) => {
    const request = store.put(mutation);
    request.onsuccess = () => resolve();
  });
}

export async function listWorkoutMutations(userId: string, sessionId: string) {
  return await transaction<WorkoutMutation[]>("readonly", (store, resolve) => {
    const request = store.getAll();
    request.onsuccess = () =>
      resolve(
        (request.result as WorkoutMutation[]).filter(
          (item) => item.userId === userId && item.sessionId === sessionId,
        ),
      );
  });
}

export async function removeWorkoutMutation(mutationId: string) {
  await transaction<void>("readwrite", (store, resolve) => {
    const request = store.delete(mutationId);
    request.onsuccess = () => resolve();
  });
}

export async function purgeWorkoutMutations(
  userId: string,
  sessionId?: string,
) {
  const items = await transaction<WorkoutMutation[]>(
    "readonly",
    (store, resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as WorkoutMutation[]);
    },
  );
  await Promise.all(
    items
      .filter(
        (item) =>
          item.userId === userId &&
          (sessionId === undefined || item.sessionId === sessionId),
      )
      .map((item) => removeWorkoutMutation(item.mutationId)),
  );
}

export async function clearWorkoutQueue() {
  await new Promise<void>((resolve) => {
    if (!globalThis.indexedDB) return resolve();
    const request = indexedDB.deleteDatabase(WORKOUT_QUEUE_DATABASE);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}
