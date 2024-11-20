import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City, CityDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCreateCity = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<City, AxiosError, CityDto, MutationContext>({
    mutationFn: (cityDto) =>
      ApiClient.getInstance().post<City, CityDto>(
        `v2/${ApiEntities.City}`,
        cityDto
      ),
    onSettled: (city) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.cities, city?.country.id],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("tournament.participants.list.city_added"),
    }),
  });
};
