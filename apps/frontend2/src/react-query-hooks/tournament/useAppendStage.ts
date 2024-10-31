import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Stage, StageDto, TournamentSeason } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useAppendStage = (tournamentSeason: TournamentSeason) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Stage, AxiosError, StageDto>({
    mutationFn: (stageDto) =>
      ApiClient.getInstance().post<Stage, StageDto>(
        `${ApiEntities.Tournament}/${tournamentSeason.season}/${tournamentSeason.tournament}/stage`,
        stageDto
      ),
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
      success: t("home.tournament.created"),
    }),
  });
};
