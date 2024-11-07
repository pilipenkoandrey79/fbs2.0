import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City, CityDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateCity = (countryId: number | undefined) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<City, AxiosError, CityDto & { id: number }>({
    mutationFn: (city) =>
      ApiClient.getInstance().put<City, CityDto>(
        `${ApiEntities.City}/v2/${city.id}`,
        city
      ),
    onSettled: (city) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubs, countryId],
        refetchType: "all",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubless_cities],
        refetchType: "all",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.city, city?.id],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("clubs.city.updated"),
    }),
  });
};
