(function initializePosDb() {
  const DB_NAME = "sweet-shop-pos-db";
  const STORE_NAME = "app-state";
  const DB_VERSION = 1;
  const SHARED_KEYS = new Set([
    "sweet-shop-pos:products",
    "sweet-shop-pos:orders",
    "sweet-shop-pos:expenses",
    "sweet-shop-pos:pending-transfers",
  ]);
  const API_BASE = "/api/state";
  const AUTH_BASE = "/api/auth";
  let dbPromise;

  function openDb() {
    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return dbPromise;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function transactionToPromise(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  async function getLocal(key) {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const record = await requestToPromise(store.get(key));
    return record ? record.value : undefined;
  }

  async function saveLocal(key, value) {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put({ key, value });
    return transactionToPromise(transaction);
  }

  async function migrateLegacy(defaults) {
    await Promise.all(
      Object.keys(defaults).map(async (key) => {
        const existing = await getLocal(key);
        if (existing !== undefined) {
          return;
        }

        try {
          const raw = window.localStorage.getItem(key);
          if (!raw) {
            return;
          }
          await saveLocal(key, JSON.parse(raw));
        } catch (error) {
          console.error(`Failed to migrate legacy key ${key}`, error);
        }
      })
    );
  }

  async function requestJson(url, options) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async function requestText(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.text();
  }

  async function loadSharedMany(defaults) {
    const response = await requestJson(`${API_BASE}/load-many`, {
      method: "POST",
      body: JSON.stringify({ defaults }),
    });
    return response.values || {};
  }

  async function saveShared(key, value) {
    return requestJson(`${API_BASE}/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  async function loadMany(defaults) {
    await migrateLegacy(defaults);

    const sharedDefaults = {};
    const localDefaults = {};
    Object.entries(defaults).forEach(([key, value]) => {
      if (SHARED_KEYS.has(key)) {
        sharedDefaults[key] = value;
      } else {
        localDefaults[key] = value;
      }
    });

    const entries = {};

    if (Object.keys(localDefaults).length) {
      const localEntries = await Promise.all(
        Object.entries(localDefaults).map(async ([key, fallback]) => {
          const value = await getLocal(key);
          return [key, value === undefined ? fallback : value];
        })
      );
      Object.assign(entries, Object.fromEntries(localEntries));
    }

    if (Object.keys(sharedDefaults).length) {
      try {
        Object.assign(entries, await loadSharedMany(sharedDefaults));
      } catch (error) {
        console.warn("Falling back to local shared storage", error);
        const sharedEntries = await Promise.all(
          Object.entries(sharedDefaults).map(async ([key, fallback]) => {
            const value = await getLocal(key);
            return [key, value === undefined ? fallback : value];
          })
        );
        Object.assign(entries, Object.fromEntries(sharedEntries));
      }
    }

    return entries;
  }

  async function save(key, value) {
    if (SHARED_KEYS.has(key)) {
      try {
        await saveShared(key, value);
        return;
      } catch (error) {
        console.warn(`Falling back to local save for ${key}`, error);
      }
    }

    await saveLocal(key, value);
  }

  async function login(role, password) {
    return requestJson(`${AUTH_BASE}/login`, {
      method: "POST",
      body: JSON.stringify({ role, password }),
    });
  }

  async function logout() {
    return requestJson(`${AUTH_BASE}/logout`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async function getSession() {
    return requestJson(`${AUTH_BASE}/session`);
  }

  async function getServerInfo() {
    return requestJson("/api/server-info");
  }

  async function restoreBackup(sql) {
    return requestJson("/api/admin/restore", {
      method: "POST",
      body: JSON.stringify({ sql }),
    });
  }

  async function getAuditLogs() {
    return requestJson("/api/admin/audit-logs");
  }

  async function completeOrder(order) {
    return requestJson("/api/orders/complete", {
      method: "POST",
      body: JSON.stringify({ order }),
    });
  }

  async function downloadBackup() {
    return requestText("/api/admin/backup");
  }

  function watch(keys, callback, intervalMs = 5000) {
    let previousSnapshot = "";

    async function poll() {
      const defaults = Object.fromEntries(keys.map((key) => [key, null]));
      const values = await loadMany(defaults);
      const nextSnapshot = JSON.stringify(values);
      if (previousSnapshot && previousSnapshot !== nextSnapshot) {
        callback(values);
      }
      previousSnapshot = nextSnapshot;
    }

    poll().catch((error) => console.warn("Initial watch poll failed", error));
    const timer = window.setInterval(() => {
      poll().catch((error) => console.warn("Watch poll failed", error));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }

  window.PosDb = {
    completeOrder,
    downloadBackup,
    getAuditLogs,
    getServerInfo,
    getSession,
    login,
    loadMany,
    logout,
    restoreBackup,
    save,
    watch,
  };
})();
