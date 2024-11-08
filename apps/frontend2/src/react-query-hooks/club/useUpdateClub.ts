import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiEntities, Club, ClubDto } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const useUpdateClub = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Club, AxiosError, ClubDto & { id: number }>({
    mutationFn: (club) =>
      ApiClient.getInstance().put<Club, ClubDto>(
        `${ApiEntities.Club}/v2/${club.id}`,
        club
      ),
    onSettled: (club) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.club, club?.id],
        refetchType: "all",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.cities, club?.city?.country.id],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("clubs.club.updated"),
    }),
  });
};
