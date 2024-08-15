import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useDeleteCity = (
  successCallback?: () => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, City>({
    mutationFn: (city) =>
      ApiClient.getInstance().delete<City>(`${ApiEntities.City}/${city.id}`),
    onSuccess: () => {
      onSuccess("Видалено місто");
      !!successCallback && successCallback();
    },
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.cities)
      ),
  });
};
