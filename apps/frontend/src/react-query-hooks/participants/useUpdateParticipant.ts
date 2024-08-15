import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Participant, ParticipantDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useUpdateParticipant = (
  successCallback: (participant: Participant) => void
) => {
  const queryClient = useQueryClient();

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
    onSuccess: (participant) => {
      onSuccess(`Змінено учасника ${participant.club.name}`);
      successCallback(participant);
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.participants]),
  });
};
