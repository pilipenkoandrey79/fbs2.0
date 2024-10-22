import { ApiEntities, Stage, Tournament } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const getTournamentStages = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Stage[]>(
    `${ApiEntities.Tournament}/${season}/${tournament}`
  );

export const useGetTournamentStages = (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  useQuery<Stage[], AxiosError>({
    queryKey: [QUERY_KEY.stages, tournament, season],
    queryFn: () => getTournamentStages(season, tournament),
  });
