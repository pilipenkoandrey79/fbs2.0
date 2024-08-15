import { ApiEntities, AvailableTournaments } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchTournamentSeasons = async () =>
  await ApiClient.getInstance().get<AvailableTournaments>(
    `${ApiEntities.Tournament}/seasons`
  );

export const useGetTournamentSeasons = () =>
  useQuery<AvailableTournaments, AxiosError>({
    queryKey: [QUERY_KEY.tournaments],
    queryFn: () => fetchTournamentSeasons(),
  });
