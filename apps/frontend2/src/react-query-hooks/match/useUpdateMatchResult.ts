import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Match, MatchResultDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateMatchResult = () => {
  const { season, tournament } = useParams();
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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament],
        refetchType: "all",
      });
    },
  });
};
