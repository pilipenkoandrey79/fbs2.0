import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useUpdateClub = (
  successCallback?: (club: Club) => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<Club, AxiosError, Club>({
    mutationFn: (club) =>
      ApiClient.getInstance().put<Club, Club>(
        `${ApiEntities.Club}/${club.id}`,
        club
      ),
    onSuccess: (club) => {
      onSuccess(`Змінено клуб ${club.name}`);
      !!successCallback && successCallback(club);
    },
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.clubs)
      ),
  });
};
