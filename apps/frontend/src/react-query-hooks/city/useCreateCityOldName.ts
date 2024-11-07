import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, OldCityName, _OldCityNameDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateCityOldName = (additionalKeysToInvalidate?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation<OldCityName, AxiosError, _OldCityNameDto>({
    mutationFn: (oldCityName) =>
      ApiClient.getInstance().post<OldCityName, _OldCityNameDto>(
        `${ApiEntities.City}/${oldCityName.cityId}/old-name`,
        oldCityName
      ),
    onSuccess: () => onSuccess("Додано історичну інформацію про місто"),
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.cities)
      ),
  });
};
