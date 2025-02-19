import { ApiEntities, Stage, StageInternal, Tournament } from "@fbs2.0/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { getTournamentPartMatchesQueryFn } from "../match/useGetTournamentPartMatches";

export const getTournamentStages = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Stage[]>(
    `${ApiEntities.Tournament}/${season}/${tournament}`
  );

export const useGetTournamentStages = (
  season: string | undefined,
  tournament: Tournament | undefined,
  preloadMatches = true
) => {
  const queryClient = useQueryClient();

  return useQuery<(StageInternal | Stage)[], AxiosError>({
    queryKey: [QUERY_KEY.stages, tournament, season],
    enabled: !!season && !!tournament,
    queryFn: async () => {
      const stages = await getTournamentStages(season, tournament);

      if (!preloadMatches) {
        return stages;
      }

      stages.forEach((stage) => {
        queryClient.prefetchQuery({
          queryKey: [QUERY_KEY.matches, season, tournament, stage?.stageType],
          queryFn: getTournamentPartMatchesQueryFn(season, tournament, stage),
        });
      });

      return stages.map((stage, index, stages) => ({
        ...stage,
        nextStage: stages[index + 1] ? stages[index + 1] : null,
      }));
    },
  });
};
