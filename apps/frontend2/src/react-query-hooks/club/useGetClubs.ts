import { ApiEntities, City, Club } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { isNotEmpty, prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { Language } from "../../i18n/locales";

const fetchClubs = async (countryId?: number) =>
  await ApiClient.getInstance().get<Club[]>(
    `${ApiEntities.Club}${countryId ? `?countryId=${countryId}` : ""}`
  );

export const getYearSelector = (year?: string) => (clubs: Club[]) =>
  isNotEmpty(year)
    ? clubs.map((club) => prepareClub(club, year as string))
    : clubs;

export type ClubsByCity = { city: City; clubs: Club[]; id: number };

export const getByCitySelector = (lang: Language) => (clubs: Club[]) =>
  clubs
    .reduce<ClubsByCity[]>((acc, club) => {
      const existedCityIdx = acc.findIndex(({ id }) => id === club.city.id);

      if (existedCityIdx >= 0) {
        acc[existedCityIdx].clubs.push(club);
      } else {
        acc.push({ id: club.city.id, city: club.city, clubs: [club] });
      }

      return acc;
    }, [])
    .sort((a, b) => {
      const collator = new Intl.Collator(lang);

      return collator.compare(
        (lang === Language.en ? a.city.name : a.city.name_ua) || a.city.name,
        (lang === Language.en ? b.city.name : b.city.name_ua) || b.city.name
      );
    });

export const useGetClubs = <T = Club[]>(
  countryId?: number,
  select?: (data: Club[]) => T,
  enabled = true
) =>
  useQuery<Club[], AxiosError, T>({
    queryKey: countryId ? [QUERY_KEY.clubs, countryId] : [QUERY_KEY.clubs],
    queryFn: async () => await fetchClubs(countryId),
    select,
    enabled,
  });
