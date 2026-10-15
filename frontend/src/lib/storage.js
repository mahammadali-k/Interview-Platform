// localStorage can be blocked (private mode, strict settings): the app must work without it.

export function getStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStored(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
