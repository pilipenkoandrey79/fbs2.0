import { Tournament } from "@fbs2.0/types";

export const getLogoSrc = (
  season: string | undefined,
  tournament: string | undefined
) => {
  switch (tournament as Tournament) {
    case Tournament.CHAMPIONS_LEAGUE:
      return getUCLLogoSrc(season);
    case Tournament.CUP_WINNERS_CUP:
      return "/src/assets/Cup_Winners_Cup.png";
    case Tournament.EUROPE_CONFERENCE_LEAGUE:
      return "/src/assets/UEFA_Conference_League_2024.png";
    case Tournament.EUROPE_LEAGUE:
      return getUELLogoSrc(season);
    case Tournament.FAIRS_CUP:
      return "/src/assets/UEFA_-_Inter-Cities_Fairs_Cup.svg";
    default:
      return "";
  }
};

const getUCLLogoSrc = (season: string | undefined) => {
  const startYear = Number(season?.split("-")?.[0]);

  if (startYear <= 1992) {
    return "/src/assets/UCL/before-1992.png";
  }

  if (startYear <= 1993) {
    return "/src/assets/UCL/1992.png";
  }

  if (startYear <= 1994) {
    return "/src/assets/UCL/1993-1994.png";
  }

  if (startYear <= 1996) {
    return "/src/assets/UCL/1995-1996.png";
  }

  if (startYear <= 2011) {
    return "/src/assets/UCL/1997-2011.png";
  }

  if (startYear <= 2020) {
    return "/src/assets/UCL/2012-2020.png";
  }

  return "/src/assets/UCL/since-2021.png";
};

const getUELLogoSrc = (season: string | undefined) => {
  const startYear = Number(season?.split("-")?.[0]);

  if (startYear <= 2003) {
    return "/src/assets/UEL/before-2003.png";
  }

  if (startYear <= 2008) {
    return "/src/assets/UEL/2004-2008.png";
  }

  if (startYear <= 2011) {
    return "/src/assets/UEL/2009-2011.png";
  }

  if (startYear <= 2014) {
    return "/src/assets/UEL/2012-2014.png";
  }

  if (startYear <= 2020) {
    return "/src/assets/UEL/2015-2020.png";
  }

  if (startYear <= 2023) {
    return "/src/assets/UEL/2021-2023.png";
  }

  return "/src/assets/UEL/since-2024.png";
};
