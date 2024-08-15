import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City, CityDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateCity = (
  successCallback?: (city: City) => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<City, AxiosError, CityDto>({
    mutationFn: (cityDto) =>
      ApiClient.getInstance().post<City, CityDto>(
        `${ApiEntities.City}`,
        cityDto
      ),
    onSuccess: (city) => {
      onSuccess(`Додано місто ${city.name} з ${city.country.name}`);
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
