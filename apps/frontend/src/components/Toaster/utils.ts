import { Toaster } from ".";

export const showError = (error: string | Error) =>
  Toaster.show({
    message: typeof error === "string" ? error : error.message || "Error",
    intent: "danger",
  });

export const successNotification = (message: string) =>
  Toaster.show({
    message,
    intent: "success",
  });
