import { Group, MatchesDto, Stage, TournamentStage } from "@fbs2.0/types";
import { sleep } from "@fbs2.0/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { MutationContext } from "../client";
import { QUERY_KEY } from "../query-key";

export const useUpdateKnockoutMatchTable = (
  stage: Stage,
  group: Group | undefined,
  tour: number | undefined,
) => {
  const queryClient = useQueryClient();

  return useMutation<MatchesDto, AxiosError, MatchesDto, MutationContext>({
    mutationFn: async (data) => {
      await sleep(500);

      return data;
    },
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
            tours: { [tour || 1]: data.matches },
          },
        }),
      );

      return { success: "Match table updated" };
    },
  });
};
