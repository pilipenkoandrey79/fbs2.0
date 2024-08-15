import { ApiEntities, Participant, Tournament } from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { prepareClub } from "@fbs2.0/utils";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchParticipants = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Participant[]>(
    `${ApiEntities.Participant}/${season}/${tournament}`
  );

export const useGetParticipants = (
  season: string | undefined,
  tournament: Tournament | undefined
) => {
  const startOfSeason = (season || "").split("-")[0];

  return useQuery<Participant[], AxiosError>({
    queryKey: [QUERY_KEY.participants],
    queryFn: async () => {
      const participants = await fetchParticipants(season, tournament);

      return participants
        .map((participant) => ({
          ...participant,
          club: prepareClub(participant.club, startOfSeason),
        }))
        .sort((a, b) => {
          const collator = new Intl.Collator("uk");

          return collator.compare(
            a.club.city.country.name,
            b.club.city.country.name
          );
        });
    },
    refetchOnWindowFocus: true,
  });
};
