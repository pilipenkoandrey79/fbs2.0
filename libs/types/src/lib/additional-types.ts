import {
  Participant,
  BaseMatch,
  Stage,
  Group,
  Country,
  Club,
  Tournament,
  StageType,
  TournamentSeason,
} from "./types";

export type JwtPayload = {
  sub: number;
  email: string;
};

export interface JWTTokensPair {
  accessToken: string;
  refreshToken: string;
}

export type ClubWithWinner = Participant & { isWinner?: boolean };

export interface _BaseMatchResult {
  hostScore: number | null;
  guestScore: number | null;
  label?: string;
  unplayed?: boolean;
  tech?: boolean;
}

export interface _KnockoutStageTableRowResult extends _BaseMatchResult {
  hostPen?: number | null;
  guestPen?: number | null;
  answer: boolean;
}

export interface _GroupStageTableRowResult extends _BaseMatchResult {
  hasDeductedPoints?: boolean;
}

export interface _StageTableRow {
  id: number;
  answerMatchId?: number;
  replayDate?: string;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  forceWinnerId?: number | null;
  results: _KnockoutStageTableRowResult[];
}

export interface _StageTableData {
  headers: string[];
  rows: _StageTableRow[];
}

export interface _LeagueStageData {
  table: Omit<GroupRow, "chessCells">[];
  tours: Record<number, _StageTableData>;
}

export type ChessCell = {
  label: string;
  date?: string;
  match: BaseMatch | null;
};

export interface GroupRow {
  id: number;
  team: Participant;
  results: _GroupStageTableRowResult[];
  chessCells: ChessCell[];
  games: number;
  win: number;
  draw: number;
  defeat: number;
  goals: [number, number];
  score: number;
}

export type _MatchesByStages = {
  stage: Stage;
  matches: _StageTableData | Record<Group, GroupRow[]>;
};

export interface _TournamentDataRow {
  stage: Stage;
  matches: _StageTableData | _LeagueStageData | Record<Group, GroupRow[]>;
}

export interface SeasonParticipantsClubParticipation {
  id: number;
  tournament: Tournament;
  startingStage: StageType;
  fromStage: Stage | null;
}

export interface SeasonParticipantsClub {
  club: Club;
  participations: SeasonParticipantsClubParticipation[];
  coefficient?: number;
}

export interface SeasonParticipants {
  country: Country;
  clubs: SeasonParticipantsClub[];
  coefficient?: number;
}

export interface ParticipantCoefficient {
  participant: Participant;
  coefficient: number;
  tournament: Tournament;
}

export interface Balance {
  w: number;
  d: number;
  l: number;
  u: number;
}

export interface ClubCV {
  tournamentSeason: TournamentSeason;
  start: StageType;
  finish: StageType | null;
  isWinner?: boolean;
  balance: Balance;
}

export enum CountryCVStatus {
  Winner = "winner",
  RunnerUp = "runner-up",
  Both = "both",
}

export interface CountryCV {
  tournamentSeason: TournamentSeason;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  status: CountryCVStatus;
}

// Coefficients 2.0
export interface ClubTournamentCoefficient {
  tournament: Tournament;
  coefficient: number;
}

export interface CountryClubCoefficient {
  club: Club;
  coefficient: number;
  participations: ClubTournamentCoefficient[];
}

export interface CountryCoefficient {
  country: Country;
  coefficient: number;
  clubs: CountryClubCoefficient[];
}

export interface RawCoefficientData {
  season: string;
  key: number;
  data: CountryCoefficient[];
}

export type CountrySeasonCoefficient = { season: string; coefficient: number };
export type SeasonCoefficient = { season: string; coefficient: number };

export interface CoefficientData extends CountryCoefficient {
  seasonCoefficients: SeasonCoefficient[];
  totalCoefficient: number;
}

export interface CoefficientHistoryItem {
  season: string;
  place: number | null;
  places: number;
  rank: number | null;
  totalCoefficient: number | null;
}

export interface Winner {
  tournament: TournamentSeason;
  winner: Participant | undefined;
  finalist: Participant | undefined;
}
