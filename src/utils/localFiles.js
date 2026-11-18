// Browser-side binary storage (IndexedDB) for uploaded files and recorded videos.
// Lets the app run as a pure static site (e.g. on Vercel) without a storage backend.

const DB_NAME = 'mytutor_files';
const STORE = 'blobs';
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run(mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

export async function putBlob(key, blob) {
  await run('readwrite', store => store.put(blob, key));
  return key;
}

export async function getBlob(key) {
  try {
    return (await run('readonly', store => store.get(key))) || null;
  } catch {
    return null;
  }
}

export async function deleteBlob(key) {
  try {
    await run('readwrite', store => store.delete(key));
  } catch {
    // ignore
  }
  if (urlCache.has(key)) {
    URL.revokeObjectURL(urlCache.get(key));
    urlCache.delete(key);
  }
}

// Cache object URLs so repeated renders don't leak memory
const urlCache = new Map();

export async function resolveBlobUrl(key) {
  if (!key) return null;
  if (urlCache.has(key)) return urlCache.get(key);
  const blob = await getBlob(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

// Trigger a browser download for a Blob
export function saveBlobAs(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

