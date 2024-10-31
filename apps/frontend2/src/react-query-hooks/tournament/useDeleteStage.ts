import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, TournamentSeason } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteStage = (
  tournamentSeason: TournamentSeason,
  id: number
) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<unknown, AxiosError>({
    mutationFn: () =>
      ApiClient.getInstance().delete(`${ApiEntities.Tournament}/stage/${id}`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.seasons] });

      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEY.stages,
          tournamentSeason.tournament,
          tournamentSeason.season,
        ],
      });
    },
    onMutate: () => ({
      success: t("home.tournament.stage.removed"),
    }),
  });
};
