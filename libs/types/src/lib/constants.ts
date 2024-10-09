import { StageSchemeType, StageType, Tournament } from "./types";

export const DATE_FORMAT = "YYYY-MM-DD";

export const AUTH_REDIRECT_PATH = "auth-redirect";
export const HIGHLIGHTED_CLUB_ID_SEARCH_PARAM = "highlight-club";

export const SEASON_REGEXP = /^\d{4}-\d{4}$/;
export const TABLE_ROW_HEIGHT = 26;
export const UKRAINE = "Ukraine";
export const USSR = "USSR";
export const DEFAULT_GROUPS_QUANTITY = 8;
export const DEFAULT_SWISS_LENGTH = 36;

export const ONE_MATCH_STAGES = [
  StageSchemeType.OLYMPIC_1_MATCH,
  StageSchemeType.GROUP_5_1_MATCH,
];

export const GROUP_STAGES = [
  StageSchemeType.GROUP_4_2_MATCH,
  StageSchemeType.GROUP_5_1_MATCH,
  StageSchemeType.GROUP_SEMI_FINAL,
  StageSchemeType.GROUP_ICFC,
];

export const QUALIFICATION_STAGES = [
  StageType.PRE_QUALIFY_HALF,
  StageType.PRE_QUALIFY_FINAL,
  StageType.PRE_ROUND,
  StageType.FIRST_QUALIFY,
  StageType.SECOND_QUALIFY,
  StageType.THIRD_QUALIFY,
  StageType.PLAYOFF,
];

export const TORNAMENT_PARTICIPATION_ORDERING = [
  Tournament.CHAMPIONS_LEAGUE,
  Tournament.CUP_WINNERS_CUP,
  Tournament.EUROPE_LEAGUE,
  Tournament.EUROPE_CONFERENCE_LEAGUE,
];

export const Years = {
  GLOBAL_START: 1955,
  START_OF_CHAMPIONS_LEAGUE: 1992,
  START_OF_EUROPA_LEAGUE: 2009,
  START_OF_THREE_POINTS_FOR_WIN: 1995,
  START_OF_HALF_QUALIFICATION_COEFF: 1998,
};

export const FIRST_ICFC_SEASONS = ["1955-1958", "1958-1960"];
