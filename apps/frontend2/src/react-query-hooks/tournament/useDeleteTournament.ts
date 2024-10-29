import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteTournament = (season: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<unknown, AxiosError, number>({
    mutationFn: (id) =>
      ApiClient.getInstance().delete(`${ApiEntities.Tournament}/${id}`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.seasons] });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.integrated_summary],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.summary, season],
      });
    },
    onMutate: () => ({
      success: t("home.tournament.deleted"),
    }),
  });
};
