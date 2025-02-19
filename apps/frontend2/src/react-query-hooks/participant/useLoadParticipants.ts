import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useLoadParticipants = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();

  return useMutation<number, AxiosError>({
    mutationFn: () =>
      ApiClient.getInstance().post<number>(
        `${ApiEntities.Participant}/${season}/${tournament}/copy-from-prev-season`
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
