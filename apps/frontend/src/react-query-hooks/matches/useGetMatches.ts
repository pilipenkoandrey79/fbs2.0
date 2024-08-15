import { ApiEntities, Tournament, TournamentPart } from "@fbs2.0/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchMatches = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<TournamentPart[]>(
    `${ApiEntities.Match}/${season}/${tournament}`
  );

export const useGetMatches = (
  season: string | undefined,
  tournament: Tournament | undefined
) => {
  const queryClient = useQueryClient();

  const query = useQuery<TournamentPart[], AxiosError>({
    queryKey: [QUERY_KEY.matches],
    queryFn: async () => await fetchMatches(season, tournament),
    refetchOnWindowFocus: true,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.matches] });
  };

  return { ...query, invalidate };
};
