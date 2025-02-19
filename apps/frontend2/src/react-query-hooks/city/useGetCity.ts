import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

const fetchCity = async (cityId: number | undefined) =>
  await ApiClient.getInstance().get<City>(`v2/${ApiEntities.City}/${cityId}`);

export const useGetCity = (cityId: number) =>
  useQuery<City, Error>({
    queryKey: [QUERY_KEY.city, cityId],
    queryFn: async () => (cityId >= 0 ? await fetchCity(cityId) : ({} as City)),
    select: (city: City) => ({
      ...city,
      oldNames: city.oldNames?.sort((a, b) => Number(a.till) - Number(b.till)),
    }),
  });
