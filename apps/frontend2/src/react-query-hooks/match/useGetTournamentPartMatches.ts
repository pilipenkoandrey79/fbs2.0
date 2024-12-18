import {
  ApiEntities,
  Stage,
  StageType,
  Tournament,
  TournamentStage,
} from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchStageMatches = async (
  season: string | undefined,
  tournament: Tournament | undefined,
  stage: StageType,
) =>
  await ApiClient.getInstance().get<TournamentStage>(
    `${ApiEntities.Match}/${season}/${tournament}/${encodeURIComponent(stage)}`,
  );

export const getTournamentPartMatchesQueryFn =
  (
    season: string | undefined,
    tournament: Tournament | undefined,
    stage: Stage | null,
  ) =>
  async () => {
    if (stage === null) {
      return null;
    }

    return await fetchStageMatches(season, tournament, stage.stageType);
  };

export const useGetTournamentPartMatches = (
  season: string | undefined,
  tournament: Tournament | undefined,
  stage: Stage | null,
) =>
  useQuery<TournamentStage | null, AxiosError>({
    queryKey: [QUERY_KEY.matches, season, tournament, stage?.stageType],
    queryFn: getTournamentPartMatchesQueryFn(season, tournament, stage),
  });
