import { DeductedPoints, GROUP_STAGES, TournamentPart } from "@fbs2.0/types";
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

export const transformTournamentPart = (tournamentPart: TournamentPart) =>
  GROUP_STAGES.includes(tournamentPart.stage.stageScheme.type)
    ? transformGroupStage(tournamentPart)
    : isLeagueStage(tournamentPart.stage)
    ? transformLeagueStage(tournamentPart)
    : _transformKnockoutStage(tournamentPart);

export { transformGroupStage };
export { _transformKnockoutStage };
export { getKnockoutStageMatchesData };
export { transformLeagueStage };
