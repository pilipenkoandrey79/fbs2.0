import { ClubWithWinner, GroupRow } from "./additional-types";
import { Stage, Group } from "./types";

export interface BaseMatchResult {
  hostScore: number | null;
  guestScore: number | null;
  date: string;
  unplayed?: boolean;
  tech?: boolean;
}

export interface KnockoutStageTableRowResult extends BaseMatchResult {
  hostPen?: number | null;
  guestPen?: number | null;
  answer: boolean;
  replayDate?: string;
}

export interface GroupStageTableRowResult extends BaseMatchResult {
  hasDeductedPoints?: boolean;
}

export interface StageTableRow {
  id: number;
  answerMatchId?: number;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  forceWinnerId?: number | null;
  results: KnockoutStageTableRowResult[];
}

export interface LeagueStageData {
  table: Omit<GroupRow, "chessCells">[];
  tours: Record<number, StageTableRow[]>;
}

export type MatchesByStages = {
  stage: Stage;
  matches: StageTableRow[] | Record<Group, GroupRow[]>;
};

export interface TournamentDataRow {
  stage: Stage;
  matches: StageTableRow[] | LeagueStageData | Record<Group, GroupRow[]>;
}
