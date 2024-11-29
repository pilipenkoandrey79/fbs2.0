import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club, ClubDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCreateClub = (countryId?: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Club, AxiosError, ClubDto, MutationContext>({
    mutationFn: (clubDto) =>
      ApiClient.getInstance().post<Club, ClubDto>(
        `v2/${ApiEntities.Club}`,
        clubDto
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.clubs],
        refetchType: "all",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.cities, countryId],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("tournament.participants.list.club_added"),
    }),
  });
};
