import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, DeleteMatchDto, StageType } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useDeleteMatch = (stageType: StageType) => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    unknown,
    AxiosError,
    {
      matchId: number;
      answerMatchId: number | undefined;
      clearResults?: boolean;
    },
    MutationContext
  >({
    mutationFn: ({ matchId, answerMatchId, clearResults }) =>
      ApiClient.getInstance().delete<unknown, DeleteMatchDto>(
        `${ApiEntities.Match}/${matchId}${clearResults ? "/results" : ""}`,
        { answerMatchId }
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament, stageType],
        refetchType: "all",
      });
    },
    onMutate: ({ clearResults }) => ({
      success: t(
        `tournament.stages.matches.match.${
          clearResults ? "cleared" : "removed"
        }`,
        {
          season,
          tournament,
        }
      ),
    }),
  });
};
