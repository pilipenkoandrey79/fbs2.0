import {
  ChessCell,
  Group,
  GroupRow,
  BaseMatch,
  TournamentPart,
} from "@fbs2.0/types";
import { _getStageLabel, isNotEmpty, getResultLabel } from "@fbs2.0/utils";

import { prepareGroupTeamsStanding } from "./prepare-group-standing";

const RESULT_PLACEHOLDER = "- : -";

const addChessTable = (rows: GroupRow[], matchesOfGroup: BaseMatch[]) =>
  rows.map((row, rowIndex, arr) => ({
    ...row,
    chessCells: new Array(rows.length)
      .fill(1)
      .map<ChessCell>((_, columnIndex) => {
        if (rowIndex === columnIndex) {
          return { label: "", match: null };
        }

        const rival = arr[columnIndex]?.team;

        const match = matchesOfGroup.find(
          ({ host, guest }) => host.id === row.team.id && guest.id === rival?.id
        );

        const label = match
          ? getResultLabel(match, { tech: match.tech ?? false }) ||
            RESULT_PLACEHOLDER
          : "";

        return {
          date: match?.date ?? "",
          label,
          match: match || null,
        };
      }),
  }));

const prepareMatches = (tournamentPart: TournamentPart) => {
  type MatchesByGroups = Record<Group, BaseMatch[]>;

  const matchesByGroups = tournamentPart.matches.reduce<MatchesByGroups>(
    (acc, match) => {
      if (isNotEmpty(match.group)) {
        if (Array.isArray(acc[match.group as Group])) {
          acc[match.group as Group].push(match);
        } else {
          acc[match.group as Group] = [match];
        }
      }

      return acc;
    },
    {} as MatchesByGroups
  );

  const matches = {} as Record<Group, GroupRow[]>;

  Object.keys(matchesByGroups).forEach((group) => {
    const matchesData = prepareGroupTeamsStanding(
      matchesByGroups[group as Group],
      tournamentPart.stage
    );

    matches[group as Group] = addChessTable(
      matchesData,
      matchesByGroups[group as Group]
    );
  });

  return matches;
};

export const transformGroupStage = (tournamentPart: TournamentPart) => ({
  stage: {
    ...tournamentPart.stage,
    label: _getStageLabel(tournamentPart.stage.stageType),
  },
  matches: prepareMatches(tournamentPart),
});
