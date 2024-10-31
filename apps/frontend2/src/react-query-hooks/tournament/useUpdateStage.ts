import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  Stage,
  StageUpdateDto,
  TournamentSeason,
} from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateStage = (
  tournamentSeason: TournamentSeason,
  id: number
) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Stage, AxiosError, StageUpdateDto>({
    mutationFn: (dto) =>
      ApiClient.getInstance().patch<Stage, StageUpdateDto>(
        `${ApiEntities.Tournament}/stage/${id}`,
        dto
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
      success: t("home.tournament.stage.updated"),
    }),
  });
};
