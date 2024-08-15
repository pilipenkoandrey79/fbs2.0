import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useUpdateCity = (
  successCallback?: (city: City) => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<City, AxiosError, City>({
    mutationFn: (city) =>
      ApiClient.getInstance().put<City, City>(
        `${ApiEntities.City}/${city.id}`,
        city
      ),
    onSuccess: (city) => {
      onSuccess(`Змінено місто ${city.name} з ${city.country.name}`);
      !!successCallback && successCallback(city);
    },
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.cities)
      ),
  });
};
