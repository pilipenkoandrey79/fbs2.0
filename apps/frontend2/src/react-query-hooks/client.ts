import { QueryClient } from "@tanstack/react-query";
import { AxiosError, HttpStatusCode } from "axios";

export const queryClient = new QueryClient({
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
