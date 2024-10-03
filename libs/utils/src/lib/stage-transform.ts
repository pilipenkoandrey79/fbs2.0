import {
  DeductedPoints,
  Group,
  GROUP_STAGES,
  GroupRow,
  LeagueStageData,
  StageSchemeType,
  TournamentPart,
} from "@fbs2.0/types";
import { isLeagueStage } from "./common";

import { transformGroupStage } from "./group-stage-tarnsform";
import { transformLeagueStage } from "./league-stage-tarnsform";
import {
  _transformKnockoutStage,
  getKnockoutStageMatchesData,
} from "./knockout-stage-transform";

export const getPointsToSubtract = (
  deductedPoints: DeductedPoints[],
  participantId: number | undefined
) =>
  deductedPoints.reduce<number>((acc, deductedPointsEntry) => {
    if (participantId === deductedPointsEntry.participant.id) {
      acc += deductedPointsEntry.points;
    }

    return acc;
  }, 0);

export const transformTournamentPart = (
  tournamentPart: TournamentPart | undefined
) => {
  switch (tournamentPart?.stage.stageScheme.type) {
    case StageSchemeType.OLYMPIC_1_MATCH:
    case StageSchemeType.OLYMPIC_2_MATCH:
      return getKnockoutStageMatchesData(tournamentPart);
    case StageSchemeType.GROUP_4_2_MATCH:
    case StageSchemeType.GROUP_5_1_MATCH:
    case StageSchemeType.GROUP_SEMI_FINAL:
    case StageSchemeType.GROUP_ICFC:
      return {} as Record<Group, GroupRow[]>;
    case StageSchemeType.LEAGUE:
      return {} as LeagueStageData;
    default:
      return [];
  }
};

export const _transformTournamentPart = (tournamentPart: TournamentPart) =>
  GROUP_STAGES.includes(tournamentPart.stage.stageScheme.type)
    ? transformGroupStage(tournamentPart)
    : isLeagueStage(tournamentPart.stage)
    ? transformLeagueStage(tournamentPart)
    : _transformKnockoutStage(tournamentPart);

export { transformGroupStage };
export { _transformKnockoutStage };
export { getKnockoutStageMatchesData };
export { transformLeagueStage };
