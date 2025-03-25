import {
  ApiEntities,
  Group,
  MatchesDto,
  Stage,
  Tournament,
  TournamentStage,
} from "@fbs2.0/types";
import { getWinnerDefinitor } from "@fbs2.0/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { MutationContext } from "../client";
import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

export const useUpdateKnockoutMatchTable = (
  season: string | undefined,
  tournament: Tournament | undefined,
  stage: Stage,
  group: Group | undefined,
  tour: number | undefined,
) => {
  const queryClient = useQueryClient();

  return useMutation<TournamentStage, AxiosError, MatchesDto, MutationContext>({
    mutationFn: async (data) =>
      ApiClient.getInstance().put<TournamentStage, MatchesDto>(
        `${ApiEntities.Match}/${season}/${tournament}/${encodeURIComponent(stage.stageType)}`,
        data,
      ),
    onMutate: (data) => {
      queryClient.setQueryData(
        [
          QUERY_KEY.matches,
          stage.tournamentSeason.season,
          stage.tournamentSeason.tournament,
          stage.stageType,
        ],
        (oldData: TournamentStage) => ({
          ...oldData,
          [group as Group]: {
            ...oldData?.[group as Group],
            tours: {
              ...oldData?.[group as Group]?.tours,
              [tour || 1]: data.matches.map(
                getWinnerDefinitor(!!stage.stageScheme.awayGoal),
              ),
            },
          },
        }),
      );

      return { success: "Match table updated" };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [
          QUERY_KEY.matches,
          stage.tournamentSeason.season,
          stage.tournamentSeason.tournament,
          stage.stageType,
        ],
        data,
      );
    },
  });
};
