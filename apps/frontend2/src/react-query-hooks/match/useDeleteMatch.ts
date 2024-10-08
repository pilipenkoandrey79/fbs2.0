import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, DeleteMatchDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteMatch = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    { matchId: number; answerMatchId: number | undefined }
  >({
    mutationFn: ({ matchId, answerMatchId }) =>
      ApiClient.getInstance().delete<unknown, DeleteMatchDto>(
        `${ApiEntities.Match}/${matchId}`,
        { answerMatchId }
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament],
        refetchType: "all",
      });
    },
  });
};
