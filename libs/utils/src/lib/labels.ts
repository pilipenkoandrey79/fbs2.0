import { Tournament, Years } from "@fbs2.0/types";

export const getTournamentTitle = (
  { season, tournament }: { season?: string; tournament?: Tournament },
  options?: { short?: boolean }
): string => {
  const { short } = options || {};
  const startYear = (season || "").split("-").map((v) => Number(v))[0];
  let title = `tournament.title.${tournament}.${short ? "short" : "full"}`;

  if (tournament === Tournament.CHAMPIONS_LEAGUE) {
    title += `.${startYear < Years.START_OF_CHAMPIONS_LEAGUE ? "old" : "new"}`;
  }

  if (tournament === Tournament.EUROPE_LEAGUE) {
    title += `.${startYear < Years.START_OF_EUROPA_LEAGUE ? "old" : "new"}`;
  }

  return title;
};
