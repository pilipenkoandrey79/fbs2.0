import {
  Club,
  RawCoefficientData,
  Country,
  CountrySeasonCoefficient,
  Match,
  Participant,
  ParticipantCoefficient,
  QUALIFICATION_STAGES,
  StageType,
  Tournament,
  USSR,
  Years,
  CoefficientData,
} from '@fbs2.0/types';
import { DateTime } from 'luxon';

import { Bonus, getBonuses } from './bonus-coefficients';

export enum SortBy {
  Country = 'country',
  Current = 'current',
  Total = 'total',
}

const OLD_GERMANY = 'ФРН';
const NEW_GERMANY = 'Німеччина';
const RF = 'Росія';

const isCovidPeriod = (match: Match) => {
  if (match.stage.tournamentSeason.season === '2019-2020') {
    if (
      match.stage.tournamentSeason.tournament === Tournament.EUROPE_LEAGUE &&
      match.stage.stageType === StageType.ROUND_16 &&
      DateTime.fromISO(match.date ?? '') > DateTime.fromISO('2020-04-01') &&
      !match.answer
    ) {
      return true;
    }

    return [StageType.QUARTER_FINAL, StageType.SEMI_FINAL].includes(
      match.stage.stageType
    );
  }

  if (match.stage.tournamentSeason.season === '2020-2021') {
    if (
      match.stage.tournamentSeason.tournament === Tournament.CHAMPIONS_LEAGUE
    ) {
      return [
        StageType.FIRST_QUALIFY,
        StageType.SECOND_QUALIFY,
        StageType.THIRD_QUALIFY,
      ].includes(match.stage.stageType);
    }

    if (match.stage.tournamentSeason.tournament === Tournament.EUROPE_LEAGUE) {
      return [
        StageType.PRE_ROUND,
        StageType.FIRST_QUALIFY,
        StageType.SECOND_QUALIFY,
        StageType.THIRD_QUALIFY,
        StageType.PLAYOFF,
      ].includes(match.stage.stageType);
    }
  }

  return false;
};

const calculateCoefficientInMatch = (
  score: number | null,
  rivalScore: number | null,
  isQualification: boolean,
  isCovidPeriod: boolean
) =>
  score === null || rivalScore === null
    ? 0
    : ((score > rivalScore ? 2 : score === rivalScore ? 1 : 0) +
        (isCovidPeriod ? 1 : 0)) /
      (isQualification ? 2 : 1);

const getClubCoefficient = (club: Club, match: Match, year: number) => {
  const isQualification =
    year >= Years.START_OF_HALF_QUALIFICATION_COEFF &&
    QUALIFICATION_STAGES.includes(match.stage.stageType);

  if (match.host.club.id === club.id) {
    return match.unplayed || match.tech
      ? 0
      : calculateCoefficientInMatch(
          match.hostScore,
          match.guestScore,
          isQualification,
          isCovidPeriod(match)
        );
  }

  if (match.guest.club.id === club.id) {
    return match.unplayed || match.tech
      ? 0
      : calculateCoefficientInMatch(
          match.guestScore,
          match.hostScore,
          isQualification,
          isCovidPeriod(match)
        );
  }

  return 0;
};

const getParticipantCoefficient = (
  club: Club,
  matches: Match[],
  bonuses: Bonus[],
  year: number
) => {
  const coefficientByMatches = matches.reduce<number>(
    (acc, match) => acc + getClubCoefficient(club, match, year),
    0
  );

  const bonusCoefficient = bonuses.reduce<number>((acc, bonus) => {
    if (bonus.clubsIds.includes(club.id)) {
      return acc + bonus.coefficient;
    }

    return acc;
  }, 0);

  return coefficientByMatches + bonusCoefficient;
};

export const calculateClubCoefficients = (
  participants: Participant[],
  matches: Match[],
  year: number
): ParticipantCoefficient[] => {
  const participantsByTournament = participants.reduce<
    { participants: Participant[]; tournament: Tournament }[]
  >((acc, participant) => {
    const tournamentIndex = acc.findIndex(
      ({ tournament }) => tournament === participant.tournamentSeason.tournament
    );

    if (tournamentIndex < 0) {
      acc.push({
        tournament: participant.tournamentSeason.tournament,
        participants: [participant],
      });
    } else {
      acc[tournamentIndex].participants.push(participant);
    }

    return acc;
  }, []);

  const matchesByTournament = matches.reduce<
    { matches: Match[]; tournament: Tournament }[]
  >((acc, match) => {
    const tournamentIndex = acc.findIndex(
      ({ tournament }) => tournament === match.stage.tournamentSeason.tournament
    );

    if (tournamentIndex < 0) {
      acc.push({
        tournament: match.stage.tournamentSeason.tournament,
        matches: [match],
      });
    } else {
      acc[tournamentIndex].matches.push(match);
    }

    return acc;
  }, []);

  return participantsByTournament
    .map(({ tournament, participants }) => {
      const { matches = [] } = {
        ...matchesByTournament.find(
          (record) => record.tournament === tournament
        ),
      };

      return participants.map((participant) => ({
        participant,
        tournament,
        coefficient: getParticipantCoefficient(
          participant.club,
          matches,
          getBonuses(matches, year),
          year
        ),
      }));
    })
    .flat();
};

export const calculateCoefficientData = (
  data: RawCoefficientData[],
  forSeason: string
): CoefficientData[] => {
  const germanies: Country[] = [];
  const russias: Country[] = [];

  const allCountries = data
    .reduce<Country[]>((acc, { data }) => {
      data.forEach(({ country }) => {
        if (acc.find(({ id }) => country.id === id)) {
          return;
        }

        acc.push(country);

        if (country.name === OLD_GERMANY || country.name === NEW_GERMANY) {
          if (!germanies.find(({ id }) => country.id === id)) {
            germanies.push(country);
          }
        }

        if (country.name === USSR || country.name === RF) {
          if (!russias.find(({ id }) => country.id === id)) {
            russias.push(country);
          }
        }
      });

      return acc;
    }, [])
    .filter((country) => {
      if (germanies.length < 2) {
        return true;
      }

      return country.name !== OLD_GERMANY;
    })
    .filter((country) => {
      if (russias.length < 2) {
        return true;
      }

      return country.name !== USSR;
    });

  const currentSeasonData =
    data.find(({ season }) => forSeason === season)?.data || [];

  const coefficientsByCountry = allCountries.map((country) => {
    const currentSeasonCoefficient = currentSeasonData.find(
      (item) => item.country.id === country.id
    );

    const countrySeasonCoefficients = data.reduce<CountrySeasonCoefficient[]>(
      (acc, { season, data }) => {
        if (season !== forSeason) {
          acc.push({
            season,
            coefficient:
              data.find(({ country: { id, name } }) => {
                if (
                  germanies.length === 2 &&
                  name === OLD_GERMANY &&
                  country.name === NEW_GERMANY
                ) {
                  return true;
                }

                if (
                  russias.length === 2 &&
                  name === USSR &&
                  country.name === RF
                ) {
                  return true;
                }

                return country.id === id;
              })?.coefficient || 0,
          });
        }

        return acc;
      },
      []
    );

    const totalCoefficient =
      countrySeasonCoefficients.reduce<number>(
        (acc, { coefficient }) => acc + coefficient,
        0
      ) + (currentSeasonCoefficient?.coefficient || 0);

    return {
      country,
      clubs: currentSeasonCoefficient?.clubs || [],
      coefficient: currentSeasonCoefficient?.coefficient || 0,
      seasonCoefficients: countrySeasonCoefficients,
      totalCoefficient,
    };
  });

  return coefficientsByCountry;
};

export const sortCoefficientData = (
  coefficientsByCountry: CoefficientData[] | undefined,
  sortBy: SortBy
) =>
  coefficientsByCountry?.sort((a, b) => {
    switch (sortBy) {
      case SortBy.Country: {
        const collator = new Intl.Collator('uk');

        return collator.compare(a.country.name, b.country.name);
      }
      case SortBy.Current:
        return b.coefficient - a.coefficient;
      case SortBy.Total:
        return b.totalCoefficient - a.totalCoefficient;
      default:
        return 0;
    }
  });
