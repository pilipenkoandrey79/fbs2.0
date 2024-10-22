import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiEntities,
  Club,
  Participant,
  ParticipantDto,
  Tournament,
} from "@fbs2.0/types";
import { AxiosError } from "axios";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { MutationContext } from "../client";

export const useCreateParticipant = () => {
  const { season, tournament } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<Participant, AxiosError, ParticipantDto, MutationContext>({
    mutationFn: (participantDto) =>
      ApiClient.getInstance().post<Participant, ParticipantDto>(
        `${ApiEntities.Participant}/${season}/${tournament}`,
        participantDto
      ),
    onSettled: () => {
      [QUERY_KEY.participants, QUERY_KEY.matches].forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: [key, season, tournament],
          refetchType: "all",
        })
      );
    },
    onMutate: (participantDto) => {
      const clubs = queryClient.getQueryData<Club[]>([QUERY_KEY.clubs]);
      const club = clubs?.find((club) => club.id === participantDto.clubId);

      if (club && season && tournament) {
        queryClient.setQueryData(
          [QUERY_KEY.participants, season, tournament],
          (old: Participant[]): Participant[] => [
            ...old,
            {
              id: -1,
              startingStage: participantDto.startingStage,
              club,
              tournamentSeason: {
                season,
                tournament: tournament as Tournament,
                id: 0,
              },
              fromStage: null,
            },
          ]
        );
      }

      return {
        success: t("tournament.participants.list.added"),
      };
    },
  });
};
