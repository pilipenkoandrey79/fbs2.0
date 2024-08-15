import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Participant } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, Participant>({
    mutationFn: (participant) =>
      ApiClient.getInstance().delete(
        `${ApiEntities.Participant}/${participant.id}`
      ),
    onSuccess: (_, participant) => {
      onSuccess(
        `Клуб ${participant.club.name} виключено з турніру ${participant.tournamentSeason.tournament} сезону ${participant.tournamentSeason.season}. Всі матчі за його участі теж видалено!`
      );
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.participants]),
  });
};
