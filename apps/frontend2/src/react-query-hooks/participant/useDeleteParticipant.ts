import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();
  const { season, tournament } = useParams();

  return useMutation<unknown, AxiosError, number>({
    mutationFn: (participantId) =>
      ApiClient.getInstance().delete(
        `${ApiEntities.Participant}/${participantId}`
      ),
    onSettled: () => {
      [QUERY_KEY.participants, QUERY_KEY.matches].forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: [key, season, tournament],
          refetchType: "all",
        })
      );
    },
  });
};
