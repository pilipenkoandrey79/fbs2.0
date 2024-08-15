import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiEntities } from "@fbs2.0/types";

import ApiClient from "../../api/api.client";
import { onError, onSuccess, refetchQueries } from "../callbacks";
import { QUERY_KEY } from "../query-key";

export const useCalculateCoefficient = () => {
  const queryClient = useQueryClient();

  return useMutation<number, AxiosError, string>({
    mutationFn: (season: string) =>
      ApiClient.getInstance().post<number>(
        `${ApiEntities.Coefficient}/${season}`
      ),
    onSuccess: (records) => onSuccess(`Розраховано ${records} коеффіцієнтів`),
    onError,
    onSettled: () => refetchQueries(queryClient, [QUERY_KEY.coefficient]),
  });
};
