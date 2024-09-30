import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, City, CityDto } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation<City, AxiosError, CityDto>({
    mutationFn: (cityDto) =>
      ApiClient.getInstance().post<City, CityDto>(
        `${ApiEntities.City}`,
        cityDto
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.cities],
        refetchType: "all",
      });
    },
  });
};
