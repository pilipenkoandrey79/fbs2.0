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
  tour: number | undefined;
  results: KnockoutStageTableRowResult[];
}

export interface TournamentStageGroup {
  table: GroupRow[] | null;
  tours: Record<number, StageTableRow[]>;
}

export type TournamentStage = Record<Group, TournamentStageGroup>;
export type TournamentPart = { stage: Stage; matches: TournamentStage };
