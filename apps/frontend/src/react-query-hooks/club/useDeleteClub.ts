import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useDeleteClub = (
  successCallback?: () => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, Club>({
    mutationFn: (club) =>
      ApiClient.getInstance().delete<Club>(`${ApiEntities.Club}/${club.id}`),
    onSuccess: () => {
      onSuccess("Видалено клуб");
      !!successCallback && successCallback();
    },
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.clubs)
      ),
  });
};
