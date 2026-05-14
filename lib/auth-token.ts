const TOKEN_KEY = "otus-em-token";
const TOKEN_EVENT = "otus-em-token-change";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function removeStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
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

