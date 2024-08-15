const LOCAL_STORAGE_KEY = "F23_API_TOKEN";

export const saveApiToken = (token: string) =>
  localStorage.setItem(LOCAL_STORAGE_KEY, token);

export const getApiToken = () => localStorage.getItem(LOCAL_STORAGE_KEY);
export const removeApiToken = () => localStorage.removeItem(LOCAL_STORAGE_KEY);
