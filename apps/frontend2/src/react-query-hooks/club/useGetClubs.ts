import { ApiEntities, Club } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { isNotEmpty, prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchClubs = async () =>
  await ApiClient.getInstance().get<Club[]>(ApiEntities.Club);

export const getYearSelector = (year?: string) => (clubs: Club[]) =>
  isNotEmpty(year)
    ? clubs.map((club) => prepareClub(club, year as string))
    : clubs;

export const useGetClubs = (select?: (data: Club[]) => Club[]) =>
  useQuery<Club[], AxiosError>({
    queryKey: [QUERY_KEY.clubs],
    queryFn: async () => await fetchClubs(),
    select,
  });
