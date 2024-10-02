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
  isReplay?: boolean;
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

export interface StageTableData {
  headers: string[];
  rows: StageTableRow[];
}

export interface LeagueStageData {
  table: Omit<GroupRow, "chessCells">[];
  tours: Record<number, StageTableData>;
}

export type MatchesByStages = {
  stage: Stage;
  matches: StageTableData | Record<Group, GroupRow[]>;
};

export interface TournamentDataRow {
  stage: Stage;
  matches: StageTableData | LeagueStageData | Record<Group, GroupRow[]>;
}
