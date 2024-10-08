import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Participant, ParticipantDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  const { season, tournament } = useParams();

  return useMutation<
    Participant,
    AxiosError,
    { id: number; participantDto: ParticipantDto }
  >({
    mutationFn: ({ id, participantDto }) =>
      ApiClient.getInstance().put<Participant, ParticipantDto>(
        `${ApiEntities.Participant}/${id}`,
        participantDto
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.participants, season, tournament],
        refetchType: "all",
      });
    },
  });
};
