import { ApiEntities, AvailableTournaments, Tournament } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchTournamentSeasons = async () =>
  await ApiClient.getInstance().get<AvailableTournaments>(
    `${ApiEntities.Tournament}/seasons?simplified=true`
  );

export const useGetTournamentSeasons = () =>
  useQuery<AvailableTournaments, AxiosError>({
    queryKey: [QUERY_KEY.seasons],
    queryFn: async () => {
      const availableTournaments = await fetchTournamentSeasons();

      const tournamentSequence = Object.values(Tournament).reduce<
        Record<Tournament, number>
      >(
        (acc, value, index) => ({ ...acc, [value]: index }),
        {} as Record<Tournament, number>
      );

      return [...Object.keys(availableTournaments || {})]
        .sort(
          (a, b) =>
            Number((a || "").split("-")[0]) - Number((b || "").split("-")[0])
        )
        .reduce<AvailableTournaments>(
          (acc, season) => ({
            ...acc,
            [season]: availableTournaments[season].sort(
              (a, b) =>
                tournamentSequence[a?.type] - tournamentSequence[b?.type]
            ),
          }),
          {}
        );
    },
  });
