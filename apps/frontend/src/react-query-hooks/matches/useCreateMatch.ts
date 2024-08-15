import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Match, MatchDto, Tournament } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateMatch = (succesCallback: (match: Match) => void) => {
  const queryClient = useQueryClient();

  return useMutation<
    Match,
    AxiosError,
    {
      tournament: Tournament | undefined;
      season: string | undefined;
      matchDto: MatchDto;
    }
  >({
    mutationFn: ({ season, tournament, matchDto }) =>
      ApiClient.getInstance().post<Match, MatchDto>(
        `${ApiEntities.Match}/${season}/${tournament}`,
        matchDto
      ),
    onSuccess: (match, { tournament, season }) => {
      onSuccess(`Додано матч до турніру ${tournament} сезону ${season}`);

      succesCallback(match);
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.matches]),
  });
};
