import { ApiEntities, Club } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { isNotEmpty, prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchClubs = async (countryId?: number) =>
  await ApiClient.getInstance().get<Club[]>(
    `${ApiEntities.Club}${countryId ? `?countryId=${countryId}` : ""}`
  );

export const getYearSelector = (year?: string) => (clubs: Club[]) =>
  isNotEmpty(year)
    ? clubs.map((club) => prepareClub(club, year as string))
    : clubs;

export const useGetClubs = <T = Club[]>(
  countryId?: number,
  select?: (data: Club[]) => T,
  enabled = true
) =>
  useQuery<Club[], AxiosError, T>({
    queryKey: countryId ? [QUERY_KEY.clubs, countryId] : [QUERY_KEY.clubs],
    queryFn: async () => await fetchClubs(countryId),
    select,
    enabled,
  });
