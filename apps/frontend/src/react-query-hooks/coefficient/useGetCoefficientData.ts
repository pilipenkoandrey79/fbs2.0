import { useQuery } from "@tanstack/react-query";
import { ApiEntities, CoefficientData } from "@fbs2.0/types";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchData = async (season: string) =>
  await ApiClient.getInstance().get<CoefficientData[]>(
    `${ApiEntities.Coefficient}/${season}/full`
  );

export const useGetCoefficientData = (season: string) =>
  useQuery<CoefficientData[], AxiosError>({
    queryKey: [QUERY_KEY.coefficient, season],
    queryFn: () => fetchData(season),
  });
