import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteCity = (countryId: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<unknown, AxiosError, City>({
    mutationFn: (city) =>
      ApiClient.getInstance().delete<City>(`${ApiEntities.City}/${city.id}`),
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
      success: t("clubs.city.deleted"),
    }),
  });
};
