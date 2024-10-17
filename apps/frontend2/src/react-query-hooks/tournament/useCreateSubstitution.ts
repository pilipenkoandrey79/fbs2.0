import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  StageSubstitution,
  StageSubstitutionDto,
} from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCreateSubstitution = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    StageSubstitution,
    AxiosError,
    StageSubstitutionDto,
    MutationContext
  >({
    mutationFn: (substitution) =>
      ApiClient.getInstance().post<StageSubstitution, StageSubstitutionDto>(
        `${ApiEntities.Tournament}/create-stage-substitution`,
        substitution
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.matches, season, tournament],
        refetchType: "all",
      });
    },
    onMutate: () => ({
      success: t("tournament.stages.substitutions.created", {
        season,
        tournament,
      }),
    }),
  });
};
