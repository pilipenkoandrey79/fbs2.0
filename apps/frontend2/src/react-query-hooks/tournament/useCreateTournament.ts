import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  StageDto,
  TournamentDto,
  TournamentSeason,
} from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<TournamentSeason, AxiosError, TournamentDto>({
    mutationFn: ({ start, end, stages, tournament }) =>
      ApiClient.getInstance().post<TournamentSeason, StageDto[]>(
        `${ApiEntities.Tournament}/${[start, end].join("-")}/${tournament}`,
        stages
      ),
    onSettled: (_, __, { start, end }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.seasons] });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.integrated_summary],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.summary, [start, end].join("-")],
      });
    },
    onMutate: () => ({
      success: t("home.tournament.created"),
    }),
  });
};
