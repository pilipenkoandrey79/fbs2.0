import { QueryClient } from "@tanstack/react-query";

import { showError, successNotification } from "../components/Toaster/utils";

export const onSuccess = (message: string) => successNotification(message);

export const onError = (error: Error) => showError(error);

export const refetchQueries = async (
  queryClient: QueryClient,
  keys: string[]
) =>
  keys.forEach(
    async (key) => await queryClient.invalidateQueries({ queryKey: [key] })
  );
