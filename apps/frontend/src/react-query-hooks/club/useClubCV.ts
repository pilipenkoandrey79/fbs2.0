import { ApiEntities, ClubCV } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchClubCV = async (id: number) =>
  await ApiClient.getInstance().get<ClubCV[]>(`${ApiEntities.Club}/${id}/cv`);

export const useClubCV = (id: number) =>
  useQuery<ClubCV[], AxiosError>({
    queryKey: [QUERY_KEY.clubCV, id],
    queryFn: () => fetchClubCV(id),
  });
