// Accès à localStorage protégé : navigation privée ou stockage bloqué ne doivent rien casser.
const PREFIX = 'cv-fm:';

function defaultStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStored(key, storage = defaultStorage()) {
  try {
    return storage?.getItem(PREFIX + key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(key, value, storage = defaultStorage()) {
  try {
    storage?.setItem(PREFIX + key, value);
  } catch {
    // Préférence non mémorisée : sans conséquence.
  }
}
