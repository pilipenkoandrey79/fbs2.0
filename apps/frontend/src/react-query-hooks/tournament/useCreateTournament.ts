import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  StageDto,
  Tournament,
  TournamentSeason,
} from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateTournament = (successCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<
    TournamentSeason,
    AxiosError,
    {
      tournament: Tournament | undefined;
      season: string | undefined;
      stages: StageDto[];
    }
  >({
    mutationFn: ({ season, stages, tournament }) =>
      ApiClient.getInstance().post<TournamentSeason, StageDto[]>(
        `${ApiEntities.Tournament}/${season}/${tournament}`,
        stages
      ),
    onSuccess: () => {
      onSuccess("Додано турнір");
      !!successCallback && successCallback();
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.tournaments]),
  });
};
