import { useQuery } from "@tanstack/react-query";
import { ApiEntities, Club } from "@fbs2.0/types";

import { QUERY_KEY } from "../query-key";
import ApiClient from "../../api/api.client";

const fetchClub = async (clubId: number | undefined) =>
  await ApiClient.getInstance().get<Club>(`${ApiEntities.Club}/v2/${clubId}`);

export const useGetClub = (clubId: number) =>
  useQuery<Club, Error>({
    queryKey: [QUERY_KEY.club, clubId],
    queryFn: async () => (clubId >= 0 ? await fetchClub(clubId) : ({} as Club)),
    select: (club: Club) => ({
      ...club,
      oldNames: club.oldNames?.sort((a, b) => Number(a.till) - Number(b.till)),
    }),
  });
