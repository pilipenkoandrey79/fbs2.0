import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, OldCityNameDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useDeleteCityOldName = (additionalKeysToInvalidate?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation<OldCityNameDto, AxiosError, number>({
    mutationFn: (id) =>
      ApiClient.getInstance().delete<OldCityNameDto>(
        `${ApiEntities.City}/old-name/${id}`
      ),
    onSuccess: () => onSuccess("Видалено історичну інформацію про місто"),
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.cities)
      ),
  });
};
