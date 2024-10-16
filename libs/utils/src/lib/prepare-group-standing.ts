import {
  DeductedPoints,
  GroupRow,
  Participant,
  Stage,
  Years,
  Tournament,
  BaseMatch,
} from "@fbs2.0/types";
import { prepareClub, isGroupFinished } from "./common";
import { getPointsToSubtract } from "./stage-transform";

import { groupSort } from "./group-sort";

const getInitialGroupRowData = (
  team: Participant,
  score: number | null,
  rivalScore: number | null,
  year: string,
  tech = false,
  deductedPoints?: DeductedPoints[]
): GroupRow => {
  const pointsToSubtract = getPointsToSubtract(deductedPoints || [], team.id);

  return {
    team: { ...team, club: prepareClub(team.club, year) },
    results: [
      {
        hostScore: score,
        guestScore: rivalScore,
        tech,
        hasDeductedPoints: pointsToSubtract,
        date: "",
      },
    ],
    chessCells: [],
    games: score !== null && rivalScore !== null ? 1 : 0,
    win: score !== null && rivalScore !== null && score > rivalScore ? 1 : 0,
    draw: score !== null && rivalScore !== null && score === rivalScore ? 1 : 0,
    defeat: score !== null && rivalScore !== null && score < rivalScore ? 1 : 0,
    goals: [score ?? 0, rivalScore ?? 0],
    score:
      (score !== null && rivalScore !== null && score > rivalScore
        ? Number(year) < Years.START_OF_THREE_POINTS_FOR_WIN
          ? 2
          : 3
        : score !== null && rivalScore !== null && score === rivalScore
        ? 1
        : 0) - pointsToSubtract,
    id: team.id,
  };
};

const prepareGroupRowData = (
  { games, win, draw, defeat, score, results, team, chessCells, id }: GroupRow,
  { hostScore, guestScore, tech, deductedPointsList }: Partial<BaseMatch>,
  year: string
): GroupRow => {
  const rowData = { team, chessCells, id } as GroupRow;
  const scoreValue = hostScore ?? null;
  const rivalScoreValue = guestScore ?? null;

  const pointsToSubtract = getPointsToSubtract(
    deductedPointsList || [],
    team.id
  );

  rowData.results = [
    ...results,
    {
      hostScore: scoreValue,
      guestScore: rivalScoreValue,
      tech: tech ?? false,
      hasDeductedPoints: pointsToSubtract,
      date: "",
    },
  ];

  rowData.games =
    games + (scoreValue !== null && rivalScoreValue !== null ? 1 : 0);

  rowData.win =
    scoreValue !== null &&
    rivalScoreValue !== null &&
    scoreValue > rivalScoreValue
      ? win + 1
      : win;

  rowData.draw =
    scoreValue !== null &&
    rivalScoreValue !== null &&
    scoreValue === rivalScoreValue
      ? draw + 1
      : draw;

  rowData.defeat =
    scoreValue !== null &&
    rivalScoreValue !== null &&
    scoreValue < rivalScoreValue
      ? defeat + 1
      : defeat;

  rowData.goals = rowData.results.reduce<[number, number]>(
    (acc, { hostScore, guestScore }) => {
      acc[0] = acc[0] + (hostScore ?? 0);
      acc[1] = acc[1] + (guestScore ?? 0);

      return acc;
    },
    [0, 0]
  );

  rowData.score =
    (scoreValue !== null &&
    rivalScoreValue !== null &&
    scoreValue > rivalScoreValue
      ? score + (Number(year) < Years.START_OF_THREE_POINTS_FOR_WIN ? 2 : 3)
      : scoreValue !== null &&
        rivalScoreValue !== null &&
        scoreValue === rivalScoreValue
      ? score + 1
      : score) - pointsToSubtract;

  return rowData;
};

const couldBeResorted = (groupRows: GroupRow[], stage: Stage) => {
  const year = Number(stage.tournamentSeason.season.split("-")[0]);

  if (
    stage.tournamentSeason.tournament === Tournament.EUROPE_LEAGUE &&
    year <= 2008
  ) {
    return false;
  }

  return isGroupFinished(groupRows, stage.stageScheme.type);
};

const getSubsetsByScore = (groupRows: GroupRow[]) =>
  groupRows.reduce<{ score: number; rows: GroupRow[] }[]>((acc, row) => {
    const existedScoreIdx = acc.findIndex(({ score }) => row.score === score);

    if (existedScoreIdx >= 0) {
      acc[existedScoreIdx].rows.push(row);
    } else {
      acc.push({ score: row.score, rows: [row] });
    }

    return acc;
  }, []);

export const prepareGroupTeamsStanding = (
  matches: BaseMatch[],
  stage: Stage
): GroupRow[] => {
  const year = stage.tournamentSeason.season.split("-")[0];

  const matchesOfGroup = matches.sort((a, b) =>
    (a.tour || 0) < (b.tour || 0) ? -1 : (a.tour || 0) === (b.tour || 0) ? 0 : 1
  );

  const groupRows = matchesOfGroup.reduce<GroupRow[]>(
    (acc, { host, guest, hostScore, guestScore, tech, deductedPointsList }) => {
      const existedHostRowIdx = acc.findIndex(
        ({ team }) => host.id === team.id
      );

      const existedGuestRowIdx = acc.findIndex(
        ({ team }) => guest.id === team.id
      );

      if (existedHostRowIdx < 0) {
        acc.push(
          getInitialGroupRowData(
            host,
            hostScore,
            guestScore,
            year,
            tech ?? false,
            deductedPointsList
          )
        );
      } else {
        acc[existedHostRowIdx] = prepareGroupRowData(
          acc[existedHostRowIdx],
          {
            hostScore,
            guestScore,
            tech,
            deductedPointsList,
          },
          year
        );
      }

      if (existedGuestRowIdx < 0) {
        acc.push(
          getInitialGroupRowData(
            guest,
            guestScore,
            hostScore,
            year,
            tech ?? false,
            deductedPointsList
          )
        );
      } else {
        acc[existedGuestRowIdx] = prepareGroupRowData(
          acc[existedGuestRowIdx],
          {
            hostScore: guestScore,
            guestScore: hostScore,
            tech,
            deductedPointsList,
          },
          year
        );
      }

      return acc;
    },
    []
  );

  groupRows.sort((a, b) => b.score - a.score);

  const subsetsByScore = getSubsetsByScore(groupRows);

  if (subsetsByScore.some((subGroup) => subGroup.rows.length > 1)) {
    groupRows.sort((a, b) =>
      groupSort(
        a,
        b,
        matchesOfGroup,
        stage,
        subsetsByScore.length === 1 &&
          subsetsByScore[0].rows.length === groupRows.length
      )
    );

    return couldBeResorted(groupRows, stage)
      ? getSubsetsByScore(groupRows)
          .map((subGroup) => {
            if (
              subGroup.rows.length <= 2 ||
              subGroup.rows.length === groupRows.length
            ) {
              return subGroup;
            }

            const subGroupTeamsIds = subGroup.rows.map(({ team }) => team.id);

            const filteredMatches = matchesOfGroup.filter(
              ({ host, guest }) =>
                subGroupTeamsIds.includes(host.id) &&
                subGroupTeamsIds.includes(guest.id)
            );

            const subGroupRows = prepareGroupTeamsStanding(
              filteredMatches,
              stage
            );

            return { score: subGroup.score, rows: subGroupRows };
          })
          .reduce<GroupRow[]>(
            (acc, subGroup) => [
              ...acc,
              ...subGroup.rows.map(
                ({ team }) =>
                  groupRows.find((row) => row.team.id === team.id) ||
                  ({} as GroupRow)
              ),
            ],
            []
          )
      : groupRows;
  }

  return groupRows;
};
