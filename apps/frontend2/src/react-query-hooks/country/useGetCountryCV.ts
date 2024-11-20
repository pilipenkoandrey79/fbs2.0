import { ApiEntities, CountryCV } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchCountryCV = async (id: number | undefined) =>
  await ApiClient.getInstance().get<CountryCV[]>(
    `${ApiEntities.Country}/${id}/cv`
  );

export const useGetCountryCV = (id: number | undefined) =>
  useQuery<CountryCV[], AxiosError>({
    queryKey: [QUERY_KEY.countryCV, id],
    queryFn: () => fetchCountryCV(id),
  });
