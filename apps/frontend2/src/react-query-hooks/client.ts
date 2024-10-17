import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError, HttpStatusCode } from "axios";
import toast from "react-hot-toast";

export type MutationContext = { success?: string };

export const onError = (error: Error | AxiosError) =>
  toast.error(
    typeof error === "string"
      ? error
      : error instanceof AxiosError
      ? error.response?.data?.message
      : (error as Error).message || "unknown error"
  );

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({
    onError,
    onSuccess: (_, __, context) => {
      const { success } = context as MutationContext;
      success && toast.success(success);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      throwOnError: (error) =>
        (error as AxiosError).response?.status === HttpStatusCode.NotFound,
    },
  },
});
