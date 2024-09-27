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
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.participants, season, tournament],
        refetchType: "all",
      });
    },
  });
};
