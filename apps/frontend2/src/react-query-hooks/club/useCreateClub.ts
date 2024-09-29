import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club, ClubDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation<Club, AxiosError, ClubDto>({
    mutationFn: (clubDto) =>
      ApiClient.getInstance().post<Club, ClubDto>(ApiEntities.Club, clubDto),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubs],
        refetchType: "all",
      });
    },
  });
};
