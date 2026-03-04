type StoredValue<T> = {
  v: T;
  exp?: number;
};

function safeParse<T>(raw: string | null): StoredValue<T> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredValue<T>;
  } catch {
    return null;
  }
}

function now(): number {
  return Date.now();
}

export function storageSet<T>(key: string, value: T, ttlSeconds?: number) {
  try {
    const record: StoredValue<T> = {
      v: value,
      exp: ttlSeconds ? now() + ttlSeconds * 1000 : undefined,
    };
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* noop: storage may be unavailable */
  }
}

export function storageGet<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    const record = safeParse<T>(raw);
    if (!record) return null;
    if (record.exp && record.exp < now()) {
      window.localStorage.removeItem(key);
      return null;
    }
    return record.v ?? null;
  } catch {
    return null;
  }
}

export function storageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function storageClear() {
  try {
    window.localStorage.clear();
  } catch {
    /* noop */
  }
}

