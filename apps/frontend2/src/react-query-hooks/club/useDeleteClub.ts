import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteClub = (countryId: number | undefined) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<unknown, AxiosError, number>({
    mutationFn: (clubId: number) =>
      ApiClient.getInstance().delete(`${ApiEntities.Club}/${clubId}`),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.cities, countryId],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("clubs.club.deleted"),
    }),
  });
};
