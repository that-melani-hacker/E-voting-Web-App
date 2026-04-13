const AUTH_STORAGE_KEY = "trinity-evoting-auth";

export const getStoredAuth = () => {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (value) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

