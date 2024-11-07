import { useQuery } from "@tanstack/react-query";
import { ApiEntities, Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";
import { BCP47Locales, Language } from "../../i18n/locales";

const useGetCountries = (year?: string) => {
  const { i18n } = useTranslation();

  return useQuery<Country[], AxiosError>({
    queryKey: [QUERY_KEY.countries],
    queryFn: async () => {
      return await ApiClient.getInstance().get<Country[]>(
        `${ApiEntities.Country}`
      );
    },
    select: (data: Country[]) => {
      const collator = new Intl.Collator(
        BCP47Locales[i18n.resolvedLanguage as Language]
      );

      const countries = data.sort((a, b) =>
        collator.compare(
          (i18n.resolvedLanguage === Language.en ? a.name : a.name_ua) ||
            a.name,
          (i18n.resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name
        )
      );

      return isNotEmpty(year)
        ? countries.filter(({ from, till }) => {
            const currentYear = Number(year);

            const byFrom = isNotEmpty(from)
              ? Number(from) <= currentYear
              : true;

            const byTill = isNotEmpty(till)
              ? Number(till) >= currentYear
              : true;

            return byFrom && byTill;
          })
        : countries;
    },
  });
};

export { useGetCountries };
