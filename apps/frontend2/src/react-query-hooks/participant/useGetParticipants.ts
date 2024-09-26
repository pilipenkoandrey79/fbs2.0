import { ApiEntities, Participant, Tournament } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchParticipants = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Participant[]>(
    `${ApiEntities.Participant}/${season}/${tournament}`
  );

export const useGetParticipants = (
  season: string | undefined,
  tournament: string | undefined
) => {
  const { i18n } = useTranslation();
  const startOfSeason = (season || "").split("-")[0];

  return useQuery<Participant[], AxiosError>({
    queryKey: [QUERY_KEY.participants, season, tournament],
    queryFn: async () =>
      (await fetchParticipants(season, tournament as Tournament))
        .map((participant) => ({
          ...participant,
          club: prepareClub(participant.club, startOfSeason),
        }))
        .sort((a, b) => {
          const collator = new Intl.Collator(i18n.resolvedLanguage);

          return collator.compare(
            a.club.city.country.name,
            b.club.city.country.name
          );
        }),
  });
};
