import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Match, MatchResultDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useUpdateMatchResult = (
  successCallback: (club: Match) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Match,
    AxiosError,
    { id: number; payload: MatchResultDto }
  >({
    mutationFn: ({ id, payload }) =>
      ApiClient.getInstance().put<Match, MatchResultDto>(
        `${ApiEntities.Match}/${id}`,
        payload
      ),
    onSuccess: (match) => {
      onSuccess("Оновлено результат матчу");
      successCallback(match);
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.matches]),
  });
};
