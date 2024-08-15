import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, OldClubNameDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useDeleteClubOldName = (additionalKeysToInvalidate?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation<OldClubNameDto, AxiosError, number>({
    mutationFn: (id) =>
      ApiClient.getInstance().delete<OldClubNameDto>(
        `${ApiEntities.Club}/old-name/${id}`
      ),
    onSuccess: () => onSuccess("Видалено історичну інформацію про клуб"),
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.clubs)
      ),
  });
};
