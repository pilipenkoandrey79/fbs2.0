import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, number>({
    mutationFn: (id) =>
      ApiClient.getInstance().delete(`${ApiEntities.Tournament}/${id}`),
    onSuccess: () => onSuccess("Видалено турнір"),
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.tournaments]),
  });
};
