const STORAGE_KEY = "dmech_device_id";

// A random id persisted in this browser's localStorage -- not personally
// identifying, just enough to tell "this is the same browser that logged in
// before" from "this is somewhere new." Cleared if the user clears site
// data, same as any other localStorage value.
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Storage disabled/unavailable (private browsing edge cases) -- login
    // still works, it just won't be recognized as a returning device.
    return "";
  }
}
