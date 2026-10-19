/**
 * persistentStorage.ts
 * EPC Suite Global Persistent Storage Engine & Database Pipeline
 * 
 * Provides 100% dynamic, stateful data fetching and storage backed by:
 * 1. Synchronous local cache for instant zero-flicker UI rendering
 * 2. Asynchronous write-through pipeline to the NestJS + PostgreSQL / Supabase backend
 * 3. Bidirectional syncing and cross-tab/cross-client reactivity
 * 4. Safe read-through: reads never overwrite remote database tables
 */

const STORAGE_EVENT = 'epc-storage-update';
const API_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api/v1/storage'
  : 'http://localhost:3000/api/v1/storage';
const AUTH_TOKEN_KEY = 'epc_suite_jwt_token';

// Track synchronization state
let isSyncing = false;
let hasInitialSynced = false;
const pendingKeyFetches = new Set<string>();

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Reads an item synchronously from local cache, while queuing a background refresh from DB.
 * NOTE: Reads will NEVER overwrite the backend database.
 */
export function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null && raw !== undefined) {
      return JSON.parse(raw) as T;
    }

    // Key not yet in local cache — return defaultValue and fetch real data from backend
    fetchSingleKeyFromBackend(key);
    return defaultValue;
  } catch (err) {
    console.warn(`[persistentStorage] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Stores item in local cache and pushes asynchronously to backend database.
 */
export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key, value } }));
    pushToBackend(key, value);
  } catch (err) {
    console.error(`[persistentStorage] Error setting key "${key}":`, err);
  }
}

/**
 * Removes item locally and deletes from backend database.
 */
export function removeStoredItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key, value: null } }));
    deleteFromBackend(key);
  } catch (err) {
    console.error(`[persistentStorage] Error removing key "${key}":`, err);
  }
}

/**
 * Appends a new item to an existing stored array.
 */
export function appendStoredItem<T>(key: string, item: T, defaultValue: T[] = []): T[] {
  const current = getStoredItem<T[]>(key, defaultValue);
  const updated = [item, ...current];
  setStoredItem(key, updated);
  return updated;
}

/**
 * Updates matching items in a stored array.
 */
export function updateStoredItem<T>(
  key: string,
  matchFn: (item: T) => boolean,
  update: Partial<T> | ((item: T) => T),
  defaultValue: T[] = []
): T[] {
  const current = getStoredItem<T[]>(key, defaultValue);
  const updated = current.map(item => {
    if (!matchFn(item)) return item;
    if (typeof update === 'function') {
      return (update as (item: T) => T)(item);
    }
    return { ...item, ...update };
  });
  setStoredItem(key, updated);
  return updated;
}

/**
 * Deletes matching items in a stored array.
 */
export function deleteStoredItem<T>(
  key: string,
  matchFn: (item: T) => boolean,
  defaultValue: T[] = []
): T[] {
  const current = getStoredItem<T[]>(key, defaultValue);
  const updated = current.filter(item => !matchFn(item));
  setStoredItem(key, updated);
  return updated;
}

/**
 * Resets all EPC module data stored in localStorage and dispatches global event.
 */
export function resetAllEpcData(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && (k.startsWith('epc_') || k.startsWith('epc_suite_'))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => {
    window.localStorage.removeItem(k);
    deleteFromBackend(k);
  });
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: '__ALL__' } }));
}

// ─── Asynchronous Backend Pipeline ─────────────────────────

async function fetchSingleKeyFromBackend(key: string): Promise<void> {
  if (pendingKeyFetches.has(key)) return;
  pendingKeyFetches.add(key);

  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(key)}`, {
      headers: getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data !== null && data !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key, value: data } }));
      }
    }
  } catch {
    // Offline or network error; keep cached value
  } finally {
    pendingKeyFetches.delete(key);
  }
}

async function pushToBackend(key: string, data: any): Promise<void> {
  try {
    await fetch(`${API_URL}/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ data }),
    });
  } catch (err) {
    // Backend may be offline or starting up; local cache ensures continuity
  }
}

async function deleteFromBackend(key: string): Promise<void> {
  try {
    await fetch(`${API_URL}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
  } catch {
    // Silent ignore on offline
  }
}

/**
 * Synchronizes all EPC module data between frontend and backend.
 * Pulls latest remote collections from PostgreSQL / Supabase into local cache.
 */
export async function syncStorageWithBackend(): Promise<{ synced: number; error?: string }> {
  if (isSyncing || typeof window === 'undefined') return { synced: 0 };
  isSyncing = true;

  try {
    const res = await fetch(`${API_URL}/bulk`, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      isSyncing = false;
      return { synced: 0, error: `Backend returned ${res.status}` };
    }

    const remoteData: Record<string, any> = await res.json();
    let syncedCount = 0;

    // 1. Pull remote records from Supabase into local cache
    for (const [key, value] of Object.entries(remoteData)) {
      if (value !== null && value !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(value));
        syncedCount++;
      }
    }

    hasInitialSynced = true;
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: '__ALL__' } }));
    return { synced: syncedCount };
  } catch (err: any) {
    return { synced: 0, error: err.message || 'Network error' };
  } finally {
    isSyncing = false;
  }
}

// Proactive initial sync on page boot if in browser
if (typeof window !== 'undefined') {
  // Sync immediately
  syncStorageWithBackend().catch(() => {});
  
  // Re-sync on window focus
  window.addEventListener('focus', () => {
    syncStorageWithBackend().catch(() => {});
  });
}
