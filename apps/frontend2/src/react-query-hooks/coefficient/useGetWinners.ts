import { useQuery } from "@tanstack/react-query";
import { ApiEntities, Winner } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchData = async (season: string) =>
  await ApiClient.getInstance().get<Winner[]>(
    `${ApiEntities.Coefficient}/${season}/winners`
  );

export const useGetWinners = (season: string) =>
  useQuery<Winner[], AxiosError>({
    queryKey: [QUERY_KEY.winners, season],
    queryFn: () => fetchData(season),
  });
