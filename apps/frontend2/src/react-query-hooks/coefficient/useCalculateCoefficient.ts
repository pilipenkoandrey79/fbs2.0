import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiEntities } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import ApiClient from "../../api/api.client";
import { MUTATION_KEY, QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCalculateCoefficient = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<number, AxiosError, string | undefined, MutationContext>({
    mutationKey: [MUTATION_KEY.calculateCoefficients],
    mutationFn: (season: string | undefined) =>
      ApiClient.getInstance().post<number>(
        `${ApiEntities.Coefficient}/${season}`
      ),
    onSettled: (_, __, season) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.coefficient, season],
        refetchType: "all",
      });
    },
    onSuccess: (number) => {
      toast.success(t("coefficient.calculated", { number }));
    },
  });
};
