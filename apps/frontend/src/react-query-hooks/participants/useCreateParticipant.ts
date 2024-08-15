import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  Participant,
  ParticipantDto,
  Tournament,
} from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateParticipant = (
  succesCallback: (participant: Participant) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Participant,
    AxiosError,
    {
      tournament: Tournament | undefined;
      season: string | undefined;
      participantDto: ParticipantDto;
    }
  >({
    mutationFn: ({ season, tournament, participantDto }) =>
      ApiClient.getInstance().post<Participant, ParticipantDto>(
        `${ApiEntities.Participant}/${season}/${tournament}`,
        participantDto
      ),
    onSuccess: (participant) => {
      onSuccess(
        `Додано клуб ${participant.club.name} до турніру ${participant.tournamentSeason.tournament} сезону ${participant.tournamentSeason.season}`
      );

      succesCallback(participant);
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.participants]),
  });
};
