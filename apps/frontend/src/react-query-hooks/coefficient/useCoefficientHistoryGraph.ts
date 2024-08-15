import { ApiEntities, CoefficientHistoryItem } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchGraphData = async (id: number) =>
  await ApiClient.getInstance().get<CoefficientHistoryItem[]>(
    `${ApiEntities.Coefficient}/country/${id}`
  );

export const useCoefficientHistoryGraph = (id: number) =>
  useQuery<CoefficientHistoryItem[], AxiosError>({
    queryKey: [QUERY_KEY.coefficientGraph, id],
    queryFn: () => fetchGraphData(id),
  });
