import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Match, MatchDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCreateMatch = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Match, AxiosError, MatchDto, MutationContext>({
    mutationFn: (matchDto) =>
      ApiClient.getInstance().post<Match, MatchDto>(
        `${ApiEntities.Match}/${season}/${tournament}`,
        matchDto
      ),
    onSettled: (_, __, matchDto) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament, matchDto.stageType],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("tournament.stages.matches.match.added", {
        season,
        tournament,
      }),
    }),
  });
};
