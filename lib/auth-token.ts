const TOKEN_KEY = "otus-em-token";
const TOKEN_EVENT = "otus-em-token-change";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }

  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function removeStoredToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }

  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function subscribeToTokenChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(TOKEN_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(TOKEN_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
