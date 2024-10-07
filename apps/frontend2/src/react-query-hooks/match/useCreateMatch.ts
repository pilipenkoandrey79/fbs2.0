import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Match, MatchDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useCreateMatch = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();

  return useMutation<Match, AxiosError, MatchDto>({
    mutationFn: (matchDto) =>
      ApiClient.getInstance().post<Match, MatchDto>(
        `${ApiEntities.Match}/${season}/${tournament}`,
        matchDto
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament],
        refetchType: "all",
      });
    },
  });
};
