import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club, _ClubDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { onError, onSuccess, refetchQueries } from "../callbacks";

export const useCreateClub = (
  successCallback?: (club: Club) => void,
  additionalKeysToInvalidate?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<Club, AxiosError, _ClubDto>({
    mutationFn: (clubDto) =>
      ApiClient.getInstance().post<Club, _ClubDto>(ApiEntities.Club, clubDto),
    onSuccess: (club) => {
      onSuccess(`Додано клуб ${club.name}`);
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
