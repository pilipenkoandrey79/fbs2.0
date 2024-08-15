import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, OldClubName, OldClubNameDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateClubOldName = (additionalKeysToInvalidate?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation<OldClubName, AxiosError, OldClubNameDto>({
    mutationFn: (oldClubName) =>
      ApiClient.getInstance().post<OldClubName, OldClubNameDto>(
        `${ApiEntities.Club}/${oldClubName.clubId}/old-name`,
        oldClubName
      ),
    onSuccess: () => onSuccess("Додано історичну інформацію про клуб"),
    onError,
    onSettled: () =>
      refetchQueries(
        queryClient,
        (additionalKeysToInvalidate || []).concat(QUERY_KEY.clubs)
      ),
  });
};
