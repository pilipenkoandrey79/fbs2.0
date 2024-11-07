import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";
import { BCP47Locales, Language } from "../../i18n/locales";

const fetchCities = async () =>
  await ApiClient.getInstance().get<City[]>(`${ApiEntities.City}/v2`);

export const getCitiesByCountry =
  (countryId: number, resolvedLanguage: string | undefined) =>
  (data: City[]) => {
    const collator = new Intl.Collator(
      BCP47Locales[resolvedLanguage as Language]
    );

    return data
      .filter(({ country }) => country.id === countryId)
      .sort((a, b) =>
        collator.compare(
          (resolvedLanguage === Language.en ? a.name : a.name_ua) || a.name,
          (resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name
        )
      );
  };

export const useGetCities = (select?: (data: City[]) => City[]) =>
  useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.cities],
    queryFn: () => fetchCities(),
    select,
  });
