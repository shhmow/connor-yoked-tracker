// utils/storage.js — localStorage helpers with key prefix to avoid collisions on shared origins

const PREFIX = 'health-tracker:';

function getStore() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function loadFromStorage(key, fallback) {
  try {
    const store = getStore();
    if (!store) return fallback;
    const raw = store.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    const store = getStore();
    if (!store) return;
    store.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // storage full or unavailable
  }
}
