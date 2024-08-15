import { Participant } from "@fbs2.0/types";

export interface StageProps {
  participants: Participant[];
  version: number;
  isRefetching: boolean;
  highlightedClubId?: number;
}

export interface GroupMatchCombination {
  host: Participant;
  guest: Participant;
}
