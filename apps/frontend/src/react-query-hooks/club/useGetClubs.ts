import { ApiEntities, Club } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { isNotEmpty, prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchClubs = async () =>
  await ApiClient.getInstance().get<Club[]>(ApiEntities.Club);

export const prepareClubs = (clubs: Club[], year?: string) =>
  isNotEmpty(year)
    ? clubs.map((club) => prepareClub(club, year as string))
    : clubs;

export const useGetClubs = (year?: string) =>
  useQuery<Club[], AxiosError>({
    queryKey: [QUERY_KEY.clubs],
    queryFn: async () => {
      const clubs = await fetchClubs();

      return isNotEmpty(year) ? prepareClubs(clubs, year) : clubs;
    },
    refetchOnWindowFocus: true,
  });
