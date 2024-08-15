import { useQuery } from "@tanstack/react-query";
import { ApiEntities, City } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

const fetchCities = async () =>
  await ApiClient.getInstance().get<City[]>(`${ApiEntities.City}`);

export const useGetCities = () =>
  useQuery<City[], AxiosError>({
    queryKey: [QUERY_KEY.cities],
    queryFn: () => fetchCities(),
  });
