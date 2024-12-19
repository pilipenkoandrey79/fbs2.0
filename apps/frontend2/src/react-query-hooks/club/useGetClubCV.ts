import { ApiEntities, ClubCV } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchClubCV = async (id: number | undefined, till?: string) =>
  await ApiClient.getInstance().get<ClubCV[]>(
    `${ApiEntities.Club}/${id}/cv${till ? `?till=${till}` : ""}`,
  );

export const useGetClubCV = (id: number | undefined, till?: string) =>
  useQuery<ClubCV[], AxiosError>({
    queryKey: till ? [QUERY_KEY.clubCV, id, till] : [QUERY_KEY.clubCV, id],
    queryFn: () => fetchClubCV(id, till),
    enabled: id !== undefined,
  });
