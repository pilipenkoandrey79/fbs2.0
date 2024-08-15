import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, DeleteMatchDto, StageTableRow } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useDeleteMatch = (successCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError,
    {
      match: Pick<StageTableRow, "host" | "guest" | "id" | "answerMatchId">;
      onlyResults: boolean;
    }
  >({
    mutationFn: ({ onlyResults, match }) =>
      ApiClient.getInstance().delete<unknown, DeleteMatchDto>(
        `${ApiEntities.Match}/${match.id}${onlyResults ? "/results" : ""}`,
        { answerMatchId: match.answerMatchId }
      ),
    onSuccess: (_, { onlyResults, match }) => {
      onSuccess(
        `${onlyResults ? `Результати матчів між` : `Матч`} ${
          match.host.club.name
        } - ${match.guest.club.name} видалено!`
      );

      !!successCallback && successCallback();
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.matches]),
  });
};
