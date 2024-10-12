import { ApiEntities, Tournament, _TournamentPart } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchMatches = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<_TournamentPart[]>(
    `${ApiEntities.Match}/${season}/${tournament}`
  );

export const useGetMatches = (
  season: string | undefined,
  tournament: string | undefined
) =>
  useQuery<_TournamentPart[], AxiosError>({
    queryKey: [QUERY_KEY.matches, season, tournament],
    queryFn: async () => await fetchMatches(season, tournament as Tournament),
  });
