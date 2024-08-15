import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

const fetchCities = async () =>
  await ApiClient.getInstance().get<City[]>(
    `${ApiEntities.City}?withoutClubs=true`
  );

export const useGetClublessCities = () =>
  useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.clublessCities],
    queryFn: () => fetchCities(),
  });
