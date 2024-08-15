import {
  ApiEntities,
  Balance,
  Combat,
  CombatDto,
  CombatRow,
  Match,
} from "@fbs2.0/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ApiClient from "../../api/api.client";
import { QUERY_KEY } from "../query-key";

const fetchCombatMatches = async (countryId: number, rivalId: number) =>
  await ApiClient.getInstance().get<Match[], CombatDto>(
    `${ApiEntities.Match}/combat`,
    { countryId, rivalId }
  );

export const useGetCombatMatches = (countryId: number, rivalId: number) =>
  useQuery<Combat, AxiosError>({
    queryKey: [QUERY_KEY.combat, countryId, rivalId],
    queryFn: async () => {
      const data = await fetchCombatMatches(countryId, rivalId);

      const rows = data.reduce<CombatRow[]>((acc, match) => {
        const { stage } = match;

        const tournamentSeasonIdx = acc.findIndex(
          ({ tournamentSeason }) =>
            tournamentSeason.id === stage.tournamentSeason.id
        );

        if (tournamentSeasonIdx >= 0) {
          const stageIdx = acc[tournamentSeasonIdx].stages.findIndex(
            (stageItem) => stageItem.stage.id === stage.id
          );

          if (stageIdx >= 0) {
            acc[tournamentSeasonIdx].stages[stageIdx].matches.push(match);
          } else {
            acc[tournamentSeasonIdx].stages.push({ stage, matches: [match] });
          }
        } else {
          acc.push({
            tournamentSeason: stage.tournamentSeason,
            stages: [{ stage, matches: [match] }],
          });
        }

        return acc;
      }, []);

      const balance = data.reduce<Balance>(
        (acc, { host, guest, hostScore, guestScore, unplayed }) => {
          if (unplayed) {
            acc.u = acc.u + 1;

            return acc;
          }

          if (host.club.city.country.id === countryId) {
            if ((hostScore ?? 0) > (guestScore ?? 0)) {
              acc.w = acc.w + 1;
            } else if ((hostScore ?? 0) < (guestScore ?? 0)) {
              acc.l = acc.l + 1;
            } else if (hostScore === guestScore) {
              acc.d = acc.d + 1;
            }
          }

          if (guest.club.city.country.id === countryId) {
            if ((guestScore ?? 0) > (hostScore ?? 0)) {
              acc.w = acc.w + 1;
            } else if ((guestScore ?? 0) < (hostScore ?? 0)) {
              acc.l = acc.l + 1;
            } else if (guestScore === hostScore) {
              acc.d = acc.d + 1;
            }
          }

          return acc;
        },
        { w: 0, d: 0, l: 0, u: 0 }
      );

      return { rows, balance };
    },
    refetchOnWindowFocus: true,
  });
