import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Country } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useUpdateCountry = (additionalKeysToInvalidate?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation<Country, AxiosError, Partial<Country>>({
    mutationFn: (country: Partial<Country>) =>
      ApiClient.getInstance().put<Country, Partial<Country>>(
        `${ApiEntities.Country}/${country.id}`,
        country
      ),
    onSuccess: (country) => onSuccess(`Змінено країну ${country.name}`),
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.countries)
      ),
  });
};
