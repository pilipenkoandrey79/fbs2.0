import { ApiEntities, TournamentSummary } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const getSeasonSummary = async (season: string | undefined) =>
  await ApiClient.getInstance().get<TournamentSummary[]>(
    `${ApiEntities.Tournament}/${season}/summary`
  );

export const useGetSeasonSummary = (season: string | undefined) =>
  useQuery<TournamentSummary[], AxiosError>({
    queryKey: [QUERY_KEY.summary, season],
    queryFn: async () => await getSeasonSummary(season),
  });
