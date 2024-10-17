import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Participant, ParticipantDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useCreateParticipant = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();

  return useMutation<Participant, AxiosError, ParticipantDto>({
    mutationFn: (participantDto) =>
      ApiClient.getInstance().post<Participant, ParticipantDto>(
        `${ApiEntities.Participant}/${season}/${tournament}`,
        participantDto
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
