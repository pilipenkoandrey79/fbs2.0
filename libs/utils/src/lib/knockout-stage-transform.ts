import {
  Participant,
  TournamentPart,
  StageTableRow,
  _StageTableRow,
  _StageTableData,
} from "@fbs2.0/types";
import { DateTime } from "luxon";
import {
  getResultLabel,
  _getStageLabel,
  getWinner,
  isNotEmpty,
  prepareClub,
} from "@fbs2.0/utils";

export const getKnockoutStageMatchesData = (tournamentPart: TournamentPart) => {
  const year = tournamentPart.stage.tournamentSeason.season.split("-")[0];
  const afterMatchPenalties = !!tournamentPart.stage.stageScheme.pen;
  const awayGoalRule = !!tournamentPart.stage.stageScheme.awayGoal;

  return tournamentPart.matches
    .reduce<StageTableRow[]>(
      (
        acc,
        {
          id,
          answer,
          date,
          host,
          guest,
          hostScore,
          guestScore,
          hostPen,
          guestPen,
          replayDate,
          forceWinner,
          unplayed,
          tech,
        }
      ) => {
        if (answer) {
          const rowIndex = acc.findIndex(
            ({ host: { id: hostId }, guest: { id: guestId } }) =>
              hostId === guest.id && guestId === host.id
          );

          acc[rowIndex].answerMatchId = id;
          acc[rowIndex].forceWinnerId = forceWinner?.id ?? null;

          acc[rowIndex].results.push({
            hostScore: guestScore,
            guestScore: hostScore,
            hostPen: afterMatchPenalties ? guestPen : undefined,
            guestPen: afterMatchPenalties ? hostPen : undefined,
            answer: true,
            unplayed: unplayed ?? false,
            tech: tech ?? false,
            date: date ?? "",
            isReplay: false,
          });

          if (isNotEmpty(replayDate) && !afterMatchPenalties) {
            acc[rowIndex].results.push({
              hostScore: guestPen,
              guestScore: hostPen,
              answer: true,
              unplayed: unplayed ?? false,
              tech: tech ?? false,
              date: replayDate ?? "",
              isReplay: true,
            });
          }

          return acc;
        } else {
          return [
            ...acc,
            {
              id,
              host: { ...host, club: prepareClub(host.club, year) },
              guest: { ...guest, club: prepareClub(guest.club, year) },
              forceWinnerId: forceWinner?.id ?? null,
              results: [
                {
                  hostScore,
                  guestScore,
                  hostPen: hostPen,
                  guestPen: guestPen,
                  answer: false,
                  unplayed: unplayed ?? false,
                  tech: tech ?? false,
                  date: date ?? "",
                },
              ],
            },
          ];
        }
      },
      []
    )
    .map((row) => {
      const { results, host, guest, forceWinnerId } = row;

      const winner = getWinner(
        results,
        awayGoalRule,
        isNotEmpty(forceWinnerId)
          ? forceWinnerId === host.id
            ? "host"
            : "guest"
          : undefined
      );

      return {
        ...row,
        host: {
          ...host,
          isWinner: winner.host,
        },
        guest: {
          ...guest,
          isWinner: winner.guest,
        },
      };
    })
    .sort((a, b) => a.id - b.id);
};

export const _transformKnockoutStage = (tournamentPart: TournamentPart) => {
  const resultHeaders: string[] = [];

  tournamentPart.matches.forEach(({ date }) => {
    if (date && !resultHeaders.includes(date)) {
      resultHeaders.push(date);
    }
  });

  resultHeaders.sort((a, b) => {
    const aDate = DateTime.fromISO(a);
    const bDate = DateTime.fromISO(b);

    return aDate < bDate ? -1 : aDate === bDate ? 0 : 1;
  });

  const matches: _StageTableData = {
    headers: ["", "", ...resultHeaders],
    rows: [],
  };

  const rows: _StageTableRow[] = [];
  const afterMatchPenalties = !!tournamentPart.stage.stageScheme.pen;

  tournamentPart.matches.forEach(
    ({
      id,
      answer,
      date,
      host,
      guest,
      hostScore,
      guestScore,
      hostPen,
      guestPen,
      replayDate,
      forceWinner,
      unplayed,
      tech,
    }) => {
      const resultIndex = date ? matches.headers.indexOf(date) : -1;
      const year = tournamentPart.stage.tournamentSeason.season.split("-")[0];

      if (answer) {
        const rowIndex = rows.findIndex(
          ({ host: { id: hostId }, guest: { id: guestId } }) =>
            hostId === guest.id && guestId === host.id
        );

        rows[rowIndex].answerMatchId = id;
        rows[rowIndex].replayDate = replayDate ?? undefined;
        rows[rowIndex].forceWinnerId = forceWinner?.id ?? null;

        rows[rowIndex].results[resultIndex] = {
          label:
            getResultLabel(
              { hostScore, guestScore, hostPen, guestPen },
              {
                answer: true,
                afterMatchPenalties,
                replayDate,
                unplayed: unplayed ?? false,
                tech: tech ?? false,
              }
            ) +
            (isNotEmpty(forceWinner) && !unplayed
              ? `. Переможець: ${
                  prepareClub((forceWinner as Participant)?.club, year).name
                } за жеребом.`
              : ""),
          hostScore: guestScore,
          guestScore: hostScore,
          hostPen: guestPen,
          guestPen: hostPen,
          answer: true,
          unplayed: unplayed ?? false,
          tech: tech ?? false,
        };
      } else {
        const row: _StageTableRow = {
          id,
          host: { ...host, club: prepareClub(host.club, year) },
          guest: { ...guest, club: prepareClub(guest.club, year) },
          results: [],
        };

        if (unplayed) {
          row.forceWinnerId = forceWinner?.id ?? null;
        }

        row.results[resultIndex] = {
          label: getResultLabel(
            { hostScore, guestScore, hostPen, guestPen },
            {
              answer: false,
              afterMatchPenalties,
              replayDate,
              unplayed: unplayed ?? false,
              tech: tech ?? false,
            }
          ),
          hostScore,
          guestScore,
          hostPen: hostPen,
          guestPen: guestPen,
          answer: false,
          unplayed: unplayed ?? false,
          tech: tech ?? false,
        };

        rows.push(row);
      }
    }
  );

  const awayGoalRule = !!tournamentPart.stage.stageScheme.awayGoal;

  matches.rows = rows
    .map((row) => {
      const { results, host, guest, forceWinnerId } = row;

      const winner = getWinner(
        results,
        awayGoalRule,
        isNotEmpty(forceWinnerId)
          ? forceWinnerId === host.id
            ? "host"
            : "guest"
          : undefined
      );

      return {
        ...row,
        host: {
          ...host,
          isWinner: winner.host,
        },
        guest: {
          ...guest,
          isWinner: winner.guest,
        },
      };
    })
    .sort((a, b) => a.id - b.id);

  return {
    stage: {
      ...tournamentPart.stage,
      label: _getStageLabel(tournamentPart.stage.stageType),
    },
    matches,
  };
};
