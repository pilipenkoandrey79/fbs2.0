import { useQuery, useQueryClient } from "@tanstack/react-query";
import { City, Club } from "@fbs2.0/types";

import { QUERY_KEY } from "../query-key";

export const useGetCity = (countryId: number | undefined, cityId: number) => {
  const queryClient = useQueryClient();

  return useQuery<City, Error>({
    queryKey: [QUERY_KEY.city, cityId],
    queryFn: () =>
      new Promise((resolve, rejest) => {
        if (cityId === -1) {
          resolve({} as City);
        }

        const city = queryClient
          .getQueryData<Club[]>([QUERY_KEY.clubs, countryId])
          ?.find(({ city }) => city.id === cityId)?.city;

        if (city) {
          resolve(city);
        } else {
          const clublessCity = queryClient
            .getQueryData<City[]>([QUERY_KEY.clubless_cities])
            ?.find(({ id }) => id === cityId);

          if (clublessCity) {
            resolve(clublessCity);
          }

          rejest(new Error("Not found"));
        }
      }),
  });
};
