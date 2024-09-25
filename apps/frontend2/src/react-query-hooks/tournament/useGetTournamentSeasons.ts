import { ApiEntities, AvailableTournaments } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchTournamentSeasons = async (simplified?: boolean) =>
  await ApiClient.getInstance().get<AvailableTournaments>(
    `${ApiEntities.Tournament}/seasons${simplified ? "?simplified=true" : ""}`
  );

export const useGetTournamentSeasons = (simplified?: boolean) =>
  useQuery<AvailableTournaments, AxiosError>({
    queryKey: [
      simplified ? QUERY_KEY.tournaments_simplified : QUERY_KEY.tournaments,
    ],
    queryFn: () => fetchTournamentSeasons(simplified),
  });
