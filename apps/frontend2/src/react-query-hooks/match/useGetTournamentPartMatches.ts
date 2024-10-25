import {
  ApiEntities,
  BaseMatch,
  Stage,
  StageInternal,
  StageType,
  Tournament,
  TournamentStage,
} from "@fbs2.0/types";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { transformTournamentPart } from "@fbs2.0/utils";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchStageMatches = async (
  season: string | undefined,
  tournament: Tournament | undefined,
  stage: StageType
) =>
  await ApiClient.getInstance().get<BaseMatch[]>(
    `${ApiEntities.Match}/${season}/${tournament}/${encodeURIComponent(stage)}`
  );

export const getTournamentPartMatchesQueryFn =
  (
    season: string | undefined,
    tournament: Tournament | undefined,
    stage: Stage | null,
    queryClient: QueryClient
  ) =>
  async () => {
    if (stage === null) {
      return null;
    }

    const matches = await fetchStageMatches(
      season,
      tournament,
      stage.stageType
    );

    if (matches.length > 0) {
      const previousStageId = stage.previousStage?.id;

      queryClient.setQueryData(
        [QUERY_KEY.stages, tournament, season],
        (old: StageInternal[]) =>
          old.map((stage) =>
            stage.id === previousStageId
              ? { ...stage, nextStageHasMatches: true }
              : stage
          )
      );
    }

    return transformTournamentPart({ matches, stage });
  };

export const useGetTournamentPartMatches = (
  season: string | undefined,
  tournament: Tournament | undefined,
  stage: Stage | null
) => {
  const queryClient = useQueryClient();

  return useQuery<TournamentStage | null, AxiosError>({
    queryKey: [QUERY_KEY.matches, season, tournament, stage?.stageType],
    queryFn: getTournamentPartMatchesQueryFn(
      season,
      tournament,
      stage,
      queryClient
    ),
  });
};
