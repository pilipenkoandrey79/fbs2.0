import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";
import { BCP47Locales, Language } from "../../i18n/locales";

const fetchCitiesByCountry = async (countryId: number | undefined) =>
  await ApiClient.getInstance().get<City[]>(
    `${ApiEntities.Country}/${countryId}/cities`
  );

export const useGetCitiesByCountry = (countryId: number | undefined) => {
  const { i18n } = useTranslation();

  return useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.cities, countryId],
    queryFn: () => fetchCitiesByCountry(countryId),
    enabled: isNotEmpty(countryId),
    select: (data: City[]) => {
      const collator = new Intl.Collator(
        BCP47Locales[i18n.resolvedLanguage as Language]
      );

      return data.sort((a, b) =>
        collator.compare(
          (i18n.resolvedLanguage === Language.en ? a.name : a.name_ua) ||
            a.name,
          (i18n.resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name
        )
      );
    },
  });
};
