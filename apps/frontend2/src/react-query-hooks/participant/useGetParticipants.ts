/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiEntities, Participant, Tournament } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { BCP47Locales, Language } from "../../i18n/locales";

const fetchParticipants = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Participant[]>(
    `${ApiEntities.Participant}/${season}/${tournament}`
  );

export const useGetParticipants = <T extends any[] = Participant[]>(
  season: string | undefined,
  tournament: string | undefined,
  select?: (data: Participant[]) => T
) => {
  const { i18n } = useTranslation();
  const startOfSeason = (season || "").split("-")[0];

  const defaultSelect = (data: Participant[]): Participant[] => {
    const collator = new Intl.Collator(
      BCP47Locales[i18n.resolvedLanguage as Language]
    );

    return data
      .map((participant) => ({
        ...participant,
        club: prepareClub(participant.club, startOfSeason),
      }))
      .sort((a, b) =>
        collator.compare(
          (i18n.resolvedLanguage === Language.en
            ? a.club.city.country.name
            : a.club.city.country.name_ua) || a.club.city.country.name,
          (i18n.resolvedLanguage === Language.en
            ? b.club.city.country.name
            : b.club.city.country.name_ua) || b.club.city.country.name
        )
      );
  };

  return useQuery<Participant[], AxiosError>({
    queryKey: [QUERY_KEY.participants, season, tournament],
    queryFn: async () =>
      await fetchParticipants(season, tournament as Tournament),
    select: select || defaultSelect,
  });
};
