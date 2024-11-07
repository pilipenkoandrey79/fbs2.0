import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

export const fetchClublessCities = async () =>
  await ApiClient.getInstance().get<City[]>(
    `${ApiEntities.City}/v2?withoutClubs=true`
  );

export const useGetClublessCities = () =>
  useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.clubless_cities],
    queryFn: () => fetchClublessCities(),
  });
