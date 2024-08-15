import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Tournament } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCopyParticipants = () => {
  const queryClient = useQueryClient();

  return useMutation<
    number,
    AxiosError,
    {
      tournament: Tournament | undefined;
      season: string | undefined;
    }
  >({
    mutationFn: ({ season, tournament }) =>
      ApiClient.getInstance().post<number>(
        `${ApiEntities.Participant}/${season}/${tournament}/copy-from-prev-season`
      ),
    onSuccess: (numberAdded) => {
      onSuccess(`Скопійовано ${numberAdded} учасників з попереднього сезону`);
    },
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.participants]),
  });
};
