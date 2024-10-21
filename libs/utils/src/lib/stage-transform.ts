import {
  BaseMatch,
  DeductedPoints,
  DEFAULT_SWISS_LENGTH,
  Group,
  GROUP_STAGES,
  StageSchemeType,
  _TournamentPart,
  TournamentStage,
  TournamentStageGroup,
} from "@fbs2.0/types";
import { getTeamsQuantityInGroup, isLeagueStage } from "./common";

import { transformGroupStage } from "./group-stage-tarnsform";
import { transformLeagueStage } from "./league-stage-tarnsform";
import {
  _transformKnockoutStage,
  getKnockoutStageMatchesData,
} from "./knockout-stage-transform";
import { prepareGroupTeamsStanding } from "./prepare-group-standing";
import { addChessTable } from "./add-chess-table";

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

const getLeagueResultsTemplate = (stageSchemeType: StageSchemeType) =>
  new Array(
    GROUP_STAGES.includes(stageSchemeType)
      ? (getTeamsQuantityInGroup(stageSchemeType) - 1) * 2
      : stageSchemeType === StageSchemeType.LEAGUE
      ? DEFAULT_SWISS_LENGTH / 4 - 1
      : 1
  )
    .fill(1)
    .reduce(
      (acc, _, index) => ({
        ...acc,
        [index + 1]: [],
      }),
      {}
    );

export const transformTournamentPart = (
  { matches, stage }: _TournamentPart = {} as _TournamentPart
): TournamentStage => {
  type MatchesByGroups = Record<Group, BaseMatch[]>;

  const matchesByGroups = matches.reduce<MatchesByGroups>((acc, match) => {
    const group = match.group ?? Group.A;

    if (Array.isArray(acc[group])) {
      acc[group].push(match);
    } else {
      acc[group] = [match];
    }

    return acc;
  }, {} as MatchesByGroups);

  return Object.keys(matchesByGroups).reduce<TournamentStage>((acc, group) => {
    const groupMatches = matchesByGroups[group as Group];

    return {
      ...acc,
      [group]: {
        table: [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
          stage.stageScheme.type
        )
          ? addChessTable(
              prepareGroupTeamsStanding(groupMatches, stage),
              groupMatches
            )
          : null,
        tours:
          groupMatches.length > 0
            ? groupMatches
                .reduce<{ tour: number; matches: BaseMatch[] }[]>(
                  (acc, match) => {
                    const tour = match.tour ?? 1;
                    const tourIdx = acc.findIndex((item) => tour === item.tour);

                    if (tourIdx >= 0) {
                      acc[tourIdx].matches.push(match);
                    } else {
                      acc.push({ tour, matches: [match] });
                    }

                    return acc;
                  },
                  []
                )
                .reduce<TournamentStageGroup["tours"]>(
                  (acc, { tour, matches }) => ({
                    ...acc,
                    [tour]: getKnockoutStageMatchesData({ matches, stage }),
                  }),
                  getLeagueResultsTemplate(stage.stageScheme.type)
                )
            : getLeagueResultsTemplate(stage.stageScheme.type),
      },
    };
  }, {} as TournamentStage);
};

export const _transformTournamentPart = (tournamentPart: _TournamentPart) =>
  GROUP_STAGES.includes(tournamentPart.stage.stageScheme.type)
    ? transformGroupStage(tournamentPart)
    : isLeagueStage(tournamentPart.stage)
    ? transformLeagueStage(tournamentPart)
    : _transformKnockoutStage(tournamentPart);

export { transformGroupStage };
export { _transformKnockoutStage };
export { getKnockoutStageMatchesData };
export { transformLeagueStage };
