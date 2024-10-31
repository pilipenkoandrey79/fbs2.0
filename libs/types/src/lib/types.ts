import { Balance } from "./additional-types";

export interface Country {
  id: number;
  name: string;
  code: string;
  from: string | null;
  till: string | null;
}

export interface City {
  id: number;
  name: string;
  country: Country;
  oldNames?: OldCityName[];
}

export interface OldCityName {
  id: number;
  name?: string;
  city: City;
  till: string;
  country?: Country;
}

export interface OldCityNameDto {
  name?: string;
  till: string;
  countryId?: number;
  cityId?: number;
}

export interface CityDto {
  name: string;
  countryId: number;
}

export interface Club {
  name: string;
  id: number;
  city: City;
  oldNames?: OldClubName[];
}

export interface OldClubName {
  name: string;
  id: number;
  till: string;
  club: Club;
}

export interface OldClubNameDto {
  name: string;
  till: string;
  clubId: number;
}

export interface ClubDto {
  name: string;
  cityId: number;
}

export interface Participant {
  id: number;
  club: Club;
  tournamentSeason: TournamentSeason;
  startingStage: StageType;
  fromStage: Stage | null;
}

export interface ParticipantDto {
  clubId: number;
  startingStage: StageType;
}

export enum Tournament {
  CHAMPIONS_LEAGUE = "UCL",
  CUP_WINNERS_CUP = "CWC",
  EUROPE_LEAGUE = "UEL",
  EUROPE_CONFERENCE_LEAGUE = "UECL",
  FAIRS_CUP = "ICFC",
}

export interface TournamentSeason {
  id: number;
  tournament: Tournament;
  season: string;
}

export interface TournamentDto {
  tournament: Tournament;
  start: number;
  end: number;
  stages: StageDto[];
}

export interface Stage {
  id: number;
  tournamentSeason: TournamentSeason;
  stageType: StageType;
  label?: string;
  stageScheme: StageScheme;
  previousStage: Stage | null;
  linkedTournament: Tournament;
  linkedTournamentStage: StageType;
  stageSubstitutions?: StageSubstitution[];
  matchesCount?: number;
}

export interface StageUpdateDto {
  isStarting: boolean;
  pen?: boolean;
  awayGoal?: boolean;
  groups?: number;
  swissNum?: number;
}

export interface StageDto extends StageUpdateDto {
  stageType: StageType;
  stageSchemeType: StageSchemeType;
  previousStageType?: StageType;
  linkedTournament?: Tournament;
  linkedStage?: StageType;
}

export interface TournamentSeasonDto {
  stages: StageDto[];
}

export interface BaseMatch {
  id: number;
  date: string | null;
  replayDate: string | null;
  answer: boolean;
  group?: Group;
  tour?: number;
  host: Participant;
  guest: Participant;
  hostScore: number | null;
  guestScore: number | null;
  hostPen: number | null;
  guestPen: number | null;
  forceWinner?: Participant | null;
  unplayed: boolean | null;
  tech?: boolean | null;
  deductedPointsList?: DeductedPoints[];
}

export interface Match extends BaseMatch {
  stage: Stage;
}

export interface MatchResultDto {
  date?: string | null;
  hostScore: number;
  guestScore: number;
  hostPen?: number;
  guestPen?: number;
  answer?: boolean;
  replayDate?: string;
  forceWinnerId?: number | null;
  unplayed?: boolean;
  tech?: boolean;
  deductions?: DeductedPointsDto[];
  tour?: number;
  group?: Group;
}

export interface MatchDto extends Partial<MatchResultDto> {
  date?: string;
  hostId: number;
  guestId: number;
  stageType: StageType;
}

export interface ClubCoefficient {
  id: number;
  club: Club;
  tournamentSeason: TournamentSeason;
  coefficient: number;
}

export interface DeleteMatchDto {
  answerMatchId?: number;
}

export enum StageType {
  PRE_QUALIFY_HALF = "PQ1/2F",
  PRE_QUALIFY_FINAL = "PQF",
  PRE_ROUND = "PR",
  FIRST_QUALIFY = "1Q",
  SECOND_QUALIFY = "2Q",
  THIRD_QUALIFY = "3Q",
  PLAYOFF = "POQ",
  LEAGUE = "LG",
  GROUP = "G",
  GROUP_2 = "G_2",
  KNOCKOUT_PLAYOFF = "KPO",
  FIRST_ROUND = "1R",
  SECOND_ROUND = "2R",
  THIRD_ROUND = "3R",
  ROUND_16 = "R16",
  QUARTER_FINAL = "1/4F",
  SEMI_FINAL = "1/2F",
  FINAL = "F",
}

export enum Group {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
}

export enum StageSchemeType {
  OLYMPIC_1_MATCH = "OLYMPIC_1",
  OLYMPIC_2_MATCH = "OLYMPIC_2",
  GROUP_4_2_MATCH = "GROUP",
  GROUP_5_1_MATCH = "GROUP_5",
  GROUP_SEMI_FINAL = "GROUP_1/2F",
  GROUP_ICFC = "GROUP_ICFC",
  LEAGUE = "LEAGUE",
}

export interface StageScheme {
  id: number;
  type: StageSchemeType;
  isStarting: boolean;
  pen: boolean | null;
  groups?: number;
  awayGoal: boolean | null;
  swissNum?: number | null;
}

export interface DeductedPoints {
  id: number;
  match: Match;
  participant: Participant;
  points: number;
}

export interface DeductedPointsDto {
  participantId: number;
  points: number;
}

export interface StageSubstitution {
  id: number;
  stage: Stage;
  expelled: Participant;
  sub: Participant;
}

export interface StageSubstitutionDto {
  stageId: number;
  expelledId: number;
  subId: number;
}

export enum ApiEntities {
  Auth = "auth",
  Club = "club",
  Country = "country",
  City = "city",
  Participant = "participant",
  Match = "match",
  Tournament = "tournament",
  Coefficient = "coefficient",
}

export interface TournamentSummary {
  id: number;
  type: Tournament;
  hasMatches: boolean;
  winner: Participant | undefined;
  finalist: Participant | undefined;
}

export interface AvailableTournament extends TournamentSummary {
  season?: string;
  hasLinkedTournaments: boolean;
}

export type AvailableTournaments = Record<string, AvailableTournament[]>;

export interface User {
  id: number;
  email: string;
  refreshToken: string;
}

export type UIUser = Omit<User, "id" | "refreshToken"> & { isEditor: boolean };

export interface _TournamentPart {
  stage: Stage;
  matches: BaseMatch[];
}

export interface CombatDto {
  countryId: number;
  rivalId: number;
}

export interface CombatRow {
  tournamentSeason: TournamentSeason;
  stages: {
    stage: Stage;
    matches: Match[];
  }[];
}

export interface Combat {
  rows: CombatRow[];
  balance: Balance;
}
