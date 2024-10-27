import { ApiEntities, AvailableTournaments } from "@fbs2.0/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchTournamentSeasons = async (simplified?: boolean) =>
  await ApiClient.getInstance().get<AvailableTournaments>(
    `${ApiEntities.Tournament}/seasons${simplified ? "?simplified=true" : ""}`
  );

export const useGetTournamentSeasons = (simplified?: boolean) => {
  const queryClient = useQueryClient();

  return useQuery<AvailableTournaments, AxiosError>({
    queryKey: [
      simplified ? QUERY_KEY.tournaments_simplified : QUERY_KEY.tournaments,
    ],
    queryFn: async () => {
      const cachedAvailableTournaments =
        queryClient.getQueryData<AvailableTournaments>([QUERY_KEY.tournaments]);

      if (cachedAvailableTournaments) {
        return cachedAvailableTournaments;
      }

      const availableTournaments = await fetchTournamentSeasons(simplified);

      return [...Object.keys(availableTournaments || {})]
        .sort(
          (a, b) =>
            Number((a || "").split("-")[0]) - Number((b || "").split("-")[0])
        )
        .reduce<AvailableTournaments>((acc, season) => {
          return { ...acc, [season]: availableTournaments[season] };
        }, {});
    },
  });
};
