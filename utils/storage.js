// utils/storage.js — localStorage helpers with key prefix to avoid collisions on shared origins

const PREFIX = 'health-tracker:';

export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}
