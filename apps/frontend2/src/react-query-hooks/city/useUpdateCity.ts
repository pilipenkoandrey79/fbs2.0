import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateCity = (countryId: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<City, AxiosError, City>({
    mutationFn: (city) =>
      ApiClient.getInstance().put<City, City>(
        `${ApiEntities.City}/${city.id}`,
        city
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubs, countryId],
        refetchType: "all",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubless_cities],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("clubs.city.updated"),
    }),
  });
};
