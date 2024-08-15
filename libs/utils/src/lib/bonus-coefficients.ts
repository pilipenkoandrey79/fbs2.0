import { StageType, Tournament, Match, Group, GroupRow } from '@fbs2.0/types';

import { isGroupFinished, prepareMatchesList } from './common';
import { transformTournamentPart } from './stage-transform';

export interface Bonus {
  stageType: StageType;
  place?: number;
  tournament: Tournament;
  coefficient: number;
  clubsIds: number[];
}

const getBonusesTemplate = (year: number): Bonus[] => {
  const template: Bonus[] = [
    Tournament.CHAMPIONS_LEAGUE,
    Tournament.CUP_WINNERS_CUP,
    Tournament.EUROPE_LEAGUE,
  ]
    .map((tournament) =>
      [StageType.QUARTER_FINAL, StageType.SEMI_FINAL, StageType.FINAL].map(
        (stageType) => ({ tournament, stageType, coefficient: 1, clubsIds: [] })
      )
    )
    .flat();

  if (year >= 1991) {
    if (year < 1994) {
      return [
        ...template,
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.GROUP,
          coefficient: 2,
          clubsIds: [],
        },
      ];
    }

    if (year < 2004) {
      return [
        ...template,
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.GROUP,
          coefficient: 1,
          clubsIds: [],
        },
      ];
    }

    if (year < 2009) {
      return [
        ...template,
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.GROUP,
          coefficient: 3,
          clubsIds: [],
        },
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.ROUND_16,
          coefficient: 1,
          clubsIds: [],
        },
      ];
    }

    if (year < 2021) {
      return [
        ...template,
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.GROUP,
          coefficient: 4,
          clubsIds: [],
        },
        {
          tournament: Tournament.CHAMPIONS_LEAGUE,
          stageType: StageType.ROUND_16,
          coefficient: 5,
          clubsIds: [],
        },
      ];
    }

    return [
      ...template,
      {
        tournament: Tournament.CHAMPIONS_LEAGUE,
        stageType: StageType.GROUP,
        coefficient: 4,
        clubsIds: [],
      },
      {
        tournament: Tournament.CHAMPIONS_LEAGUE,
        stageType: StageType.ROUND_16,
        coefficient: 5,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_LEAGUE,
        stageType: StageType.ROUND_16,
        coefficient: 1,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_CONFERENCE_LEAGUE,
        stageType: StageType.SEMI_FINAL,
        coefficient: 1,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_CONFERENCE_LEAGUE,
        stageType: StageType.FINAL,
        coefficient: 1,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_LEAGUE,
        stageType: StageType.GROUP,
        place: 1,
        coefficient: 4,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_LEAGUE,
        stageType: StageType.GROUP,
        place: 2,
        coefficient: 2,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_CONFERENCE_LEAGUE,
        stageType: StageType.GROUP,
        place: 1,
        coefficient: 2,
        clubsIds: [],
      },
      {
        tournament: Tournament.EUROPE_CONFERENCE_LEAGUE,
        stageType: StageType.GROUP,
        place: 2,
        coefficient: 1,
        clubsIds: [],
      },
    ];
  }

  return template;
};

export const getBonuses = (matches: Match[], year: number): Bonus[] =>
  getBonusesTemplate(year).map((template) => {
    const stageMatches = prepareMatchesList(matches).find(
      ({ stage }) =>
        stage.tournamentSeason.tournament === template.tournament &&
        stage.stageType === template.stageType
    );

    if (!stageMatches) {
      return template;
    }

    if (
      Number.isInteger(template.place) &&
      template.stageType === StageType.GROUP
    ) {
      const transformedStage = transformTournamentPart(stageMatches);
      const clubsIds: number[] = [];

      Object.values(
        transformedStage.matches as Record<Group, GroupRow[]>
      ).forEach((tableRows) => {
        if (
          isGroupFinished(tableRows, transformedStage.stage.stageScheme.type)
        ) {
          clubsIds.push(tableRows[(template.place || 0) - 1].team.club.id);
        }
      });

      return { ...template, clubsIds };
    } else {
      const clubsIds = stageMatches.matches.reduce<number[]>(
        (acc: any[], { host, guest }: any) => {
          const existedHost = acc.find((id) => id === host.club.id);
          const existedGuest = acc.find((id) => id === guest.club.id);

          if (!existedHost) {
            acc.push(host.club.id);
          }

          if (!existedGuest) {
            acc.push(guest.club.id);
          }

          return acc;
        },
        []
      );

      return { ...template, clubsIds };
    }
  });
