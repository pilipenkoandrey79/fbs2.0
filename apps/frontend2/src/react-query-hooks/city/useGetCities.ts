import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

const fetchCities = async () =>
  await ApiClient.getInstance().get<City[]>(`${ApiEntities.City}`);

export const getCitiesByCountry =
  (countryId: number, locale: string | undefined) => (data: City[]) => {
    const collator = new Intl.Collator(locale);

    return data
      .filter(({ country }) => country.id === countryId)
      .sort((a, b) => collator.compare(a.name, b.name));
  };

export const useGetCities = (select?: (data: City[]) => City[]) =>
  useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.cities],
    queryFn: () => fetchCities(),
    select,
  });
