import { useQuery } from "@tanstack/react-query";
import { ApiEntities, Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

export const getYearSelector = (year?: string) => (countries: Country[]) =>
  isNotEmpty(year)
    ? countries.filter(({ from, till }) => {
        const currentYear = Number(year);
        const byFrom = isNotEmpty(from) ? Number(from) <= currentYear : true;
        const byTill = isNotEmpty(till) ? Number(till) >= currentYear : true;

        return byFrom && byTill;
      })
    : countries;

const useGetCountries = (select?: (data: Country[]) => Country[]) =>
  useQuery<Country[], AxiosError>({
    queryKey: [QUERY_KEY.countries],
    queryFn: async () =>
      await ApiClient.getInstance().get<Country[]>(`${ApiEntities.Country}`),
    select,
  });

export { useGetCountries };
