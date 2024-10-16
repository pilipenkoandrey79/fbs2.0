import { DateTime } from "luxon";
import {
  Balance,
  City,
  Club,
  ClubCV,
  FIRST_ICFC_SEASONS,
  Group,
  GroupRow,
  KnockoutStageTableRowResult,
  Match,
  BaseMatch,
  ONE_MATCH_STAGES,
  SEASON_REGEXP,
  Stage,
  StageDto,
  StageSchemeType,
  StageType,
  Tournament,
  _TournamentPart,
  TournamentSeason,
  Winner,
  Years,
  DEFAULT_SWISS_LENGTH,
  DATE_FORMAT,
} from "@fbs2.0/types";
import { FormEvent } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

export const dateRenderer = (time: string | number | null) => {
  if (!time) {
    return "";
  }

  dayjs.extend(localizedFormat);

  return dayjs(time).format("ll");
};

export const formatDatePickerValue = (
  value: string | number | undefined,
  format = DATE_FORMAT
) => (!!value && dayjs(value).isValid() ? dayjs(value, format) : null);

export const normalizeDatePickerValue = (
  value: dayjs.Dayjs | null,
  format = DATE_FORMAT
) => value && `${dayjs(value).format(format)}`;

export const handleStringChange =
  (handler: (value: string) => void) => (event: FormEvent<HTMLElement>) =>
    handler((event.target as HTMLInputElement).value);

export const isNotEmpty = (value: unknown, shouldValidateEmptyString = false) =>
  value !== null &&
  value !== undefined &&
  (shouldValidateEmptyString ? value !== "" : true);

export const isSeasonLabelValid = (
  season?: string,
  validateFinishInFuture = true
) => {
  if (!season || !SEASON_REGEXP.test(season || "")) {
    return false;
  }

  if (FIRST_ICFC_SEASONS.includes(season)) {
    return true;
  }

  const seasonBoundaries = season.split("-");
  const start = Number(seasonBoundaries[0]);
  const finish = Number(seasonBoundaries[1]);

  if (start >= finish) {
    return false;
  }

  if (start < Years.GLOBAL_START) {
    return false;
  }

  if (finish - start > 1) {
    return false;
  }

  if (validateFinishInFuture && finish > DateTime.now().year) {
    return false;
  }

  return true;
};

export const isTournamentValid = (tournament?: string) =>
  Object.values(Tournament).includes(tournament as Tournament);

export const _getTournamentTitle = (
  season?: string,
  tournament?: Tournament,
  showSeason = true,
  short = false
) => {
  let title = "";
  const seasonBoundaries = (season || "").split("-").map((v) => Number(v));

  switch (tournament) {
    case Tournament.CHAMPIONS_LEAGUE:
      title = short
        ? seasonBoundaries[0] < Years.START_OF_CHAMPIONS_LEAGUE
          ? "КЄЧ"
          : "ЛЧ"
        : seasonBoundaries[0] < Years.START_OF_CHAMPIONS_LEAGUE
        ? "Кубок Європейських Чемпіонів"
        : "Ліга Чемпіонів УЄФА";
      break;
    case Tournament.CUP_WINNERS_CUP:
      title = short ? "КВК" : "Кубок Володарів Кубків";
      break;
    case Tournament.EUROPE_LEAGUE:
      title = short
        ? seasonBoundaries[0] < Years.START_OF_EUROPA_LEAGUE
          ? "КУЄФА"
          : "ЛЄ"
        : seasonBoundaries[0] < Years.START_OF_EUROPA_LEAGUE
        ? "Кубок УЄФА"
        : "Ліга Європи";
      break;
    case Tournament.EUROPE_CONFERENCE_LEAGUE:
      title = short ? "ЛК" : "Ліга Конференцій";
      break;
    case Tournament.FAIRS_CUP:
      title = short ? "КЯ" : "Кубок Ярмарок";
      break;
  }

  return `${title} ${showSeason && season ? season : ""}`;
};

export const getStageTransKey = (stageType: StageType) =>
  `tournament.stage.${stageType}${
    stageType === StageType.GROUP || stageType === StageType.GROUP_2
      ? ".short"
      : ""
  }`;

export const _getStageLabel = (stageType: StageType | null, group?: Group) => {
  switch (stageType) {
    case StageType.PRE_QUALIFY_HALF:
      return `Попередній кваліфікаційний раунд (півфінал)`;
    case StageType.PRE_QUALIFY_FINAL:
      return `Попередній кваліфікаційний раунд (фінал)`;
    case StageType.PRE_ROUND:
      return `Попередній раунд`;
    case StageType.FIRST_QUALIFY:
      return `1 кваліфікаційний раунд`;
    case StageType.SECOND_QUALIFY:
      return `2 кваліфікаційний раунд`;
    case StageType.THIRD_QUALIFY:
      return `3 кваліфікаційний раунд`;
    case StageType.PLAYOFF:
      return `Раунд плей-офф`;
    case StageType.LEAGUE:
      return `Етап ліги`;
    case StageType.GROUP:
      return `Груповий раунд${group ? `: група ${group}` : ""}`;
    case StageType.GROUP_2:
      return `Другий груповий раунд${group ? `: група ${group}` : ""}`;
    case StageType.KNOCKOUT_PLAYOFF:
      return `Плей-офф`;
    case StageType.FIRST_ROUND:
      return `Перший раунд`;
    case StageType.SECOND_ROUND:
      return `Другий раунд`;
    case StageType.THIRD_ROUND:
      return `Третій раунд`;
    case StageType.ROUND_16:
      return `Раунд 16-х`;
    case StageType.QUARTER_FINAL:
      return `1/4 фіналу`;
    case StageType.SEMI_FINAL:
      return `1/2 фіналу`;
    case StageType.FINAL:
      return `Фінал`;
    default:
      return "";
  }
};

export const getStageSchemeTypeLabel = (type: StageSchemeType) => {
  switch (type) {
    case StageSchemeType.OLYMPIC_1_MATCH:
      return "Одноматчевий на виліт";
    case StageSchemeType.OLYMPIC_2_MATCH:
      return "Двоматчевий на виліт";
    case StageSchemeType.GROUP_4_2_MATCH:
      return "Груповий двоматчевий";
    case StageSchemeType.GROUP_5_1_MATCH:
      return "Груповий одноматчевий";
    case StageSchemeType.GROUP_SEMI_FINAL:
      return 'Груповий "півфінальний"';
    case StageSchemeType.GROUP_ICFC:
      return "Груповий раунд (Кубок Ярмарків)";
    case StageSchemeType.LEAGUE:
      return '"Швейцарська" схема';
  }
};

export const isLeagueStage = (stage: Stage) =>
  stage.stageType === StageType.LEAGUE;

const renderResultLabel = (
  hs: number | null | undefined,
  gs: number | null | undefined,
  hp: number | null | undefined,
  gp: number | null | undefined,
  {
    replayDate,
    afterMatchPenalties = true,
    unplayed = false,
    tech = false,
  }: ResultLabelOptions
) => {
  if (unplayed) {
    return "-";
  }

  return isNotEmpty(hs) && isNotEmpty(gs)
    ? `${hs}:${gs}${
        isNotEmpty(hp) && isNotEmpty(gp)
          ? afterMatchPenalties
            ? ` (пен. ${hp}:${gp})`
            : ` (перегравання${
                replayDate ? ` (${replayDate})` : ""
              } ${hp}:${gp})`
          : ""
      }${tech ? " *" : ""}`
    : "";
};

export interface ResultLabelOptions {
  answer?: boolean;
  afterMatchPenalties?: boolean;
  replayDate?: string | null;
  unplayed?: boolean;
  tech?: boolean;
}

export const getResultLabel = (
  { hostScore, guestScore, hostPen, guestPen }: Partial<BaseMatch>,
  options?: ResultLabelOptions
) =>
  options?.answer
    ? renderResultLabel(guestScore, hostScore, guestPen, hostPen, {
        ...options,
      })
    : renderResultLabel(hostScore, guestScore, hostPen, guestPen, {
        ...options,
      });

export const getTeamsQuantityInGroup = (stageSchemeType: StageSchemeType) => {
  switch (stageSchemeType) {
    case StageSchemeType.GROUP_4_2_MATCH:
    case StageSchemeType.GROUP_SEMI_FINAL:
      return 4;
    case StageSchemeType.GROUP_5_1_MATCH:
      return 5;
    case StageSchemeType.GROUP_ICFC:
      return 3;
    case StageSchemeType.LEAGUE:
      return DEFAULT_SWISS_LENGTH;
    default:
      return 0;
  }
};

export const transformStageToDto = (stage: Stage): StageDto => ({
  stageType: stage.stageType,
  stageSchemeType: stage.stageScheme.type,
  linkedTournament: stage.linkedTournament,
  linkedStage: stage.linkedTournamentStage,
  isStarting: stage.stageScheme.isStarting,
  groups: stage.stageScheme.groups,
  swissNum: stage.stageScheme.swissNum ?? undefined,
  previousStageType: stage.previousStage?.stageType,
  pen: stage.stageScheme.pen ?? undefined,
  awayGoal: stage.stageScheme.awayGoal ?? undefined,
});

export const prepareClub = (club: Club, year: string) => {
  if (
    (club.oldNames || []).length === 0 &&
    (club.city?.oldNames?.length || 0) === 0
  ) {
    return club;
  }

  const givenYear = Number(year);

  const name =
    [...(club.oldNames || [])]
      .sort((a, b) => Number(a.till) - Number(b.till))
      .find(({ till }) => Number(till) > givenYear)?.name || club.name;

  let city = club.city;

  if ((club.city?.oldNames?.length || 0) > 0) {
    const oldCityName = [...(club.city?.oldNames || [])]
      .sort((a, b) => Number(a.till) - Number(b.till))
      .find(({ till }) => Number(till) > givenYear);

    const { name, country } = { ...oldCityName };

    city = {
      ...club.city,
      name: name || club.city?.name || "",
      country: country || club.city?.country,
    } as City;
  }

  return { ...club, name, city };
};

export const prepareMatchesList = (matches: Match[]) => {
  return matches
    .reduce<_TournamentPart[]>((acc, match) => {
      const { stage, ...restMatch } = match;

      const existentStageIdx = acc.findIndex(
        ({ stage }) => stage.id === match.stage.id
      );

      if (existentStageIdx >= 0) {
        const existentStage = acc[existentStageIdx];

        if (Array.isArray(existentStage.matches)) {
          existentStage.matches.push(restMatch);
        } else {
          existentStage.matches = [];
        }
      } else {
        acc.push({ stage, matches: [restMatch] });
      }

      return acc;
    }, [])
    .map(({ stage, matches }) => {
      matches.sort((a) => (a.answer ? 1 : -1));

      return { stage, matches };
    });
};

export const howMany = (number: number, noun: string) => {
  const lastDigit = number % 10;

  if (number === 0) {
    return "";
  }

  if (number > 20 || number < 10) {
    if (lastDigit === 1) {
      return `${number} ${noun}`;
    }

    if (lastDigit > 0 && lastDigit < 5) {
      return `${number} ${noun}а`;
    }
  }

  return `${number} ${noun}ів`;
};

export const isGroupFinished = (
  rows: GroupRow[],
  stageSchemeType: StageSchemeType
) =>
  rows.length > 0
    ? rows.every(
        ({ games }) =>
          games >=
          (getTeamsQuantityInGroup(stageSchemeType) - 1) *
            (ONE_MATCH_STAGES.includes(stageSchemeType) ? 1 : 2)
      )
    : false;

export const getSeasonsForCoefficientcalculation = (
  season: string | undefined
) => {
  const [start, finish] = (season || "").split("-").map((v) => Number(v));

  return [0, 1, 2, 3, 4]
    .map((_, index) => ({
      start: start - index,
      label: `${start - index}-${finish - index}`,
    }))
    .filter(({ start }) => start >= Years.GLOBAL_START)
    .map(({ label }, index) => ({ label, key: index }));
};

export const getNumGroupRows = (stageSchemeType: StageSchemeType) => {
  switch (stageSchemeType) {
    case StageSchemeType.GROUP_ICFC:
      return 3;
    case StageSchemeType.GROUP_5_1_MATCH:
      return 5;
    case StageSchemeType.GROUP_4_2_MATCH:
    case StageSchemeType.GROUP_SEMI_FINAL:
      return 4;
    default:
      return Infinity;
  }
};

export const getWinners = (matches: Match[]) =>
  matches
    .reduce<{ tournament: TournamentSeason; matches: Match[] }[]>(
      (acc, match) => {
        const existedTournamentSeasonIdx = acc.findIndex(
          ({ tournament }) => tournament.id === match.stage.tournamentSeason.id
        );

        if (existedTournamentSeasonIdx >= 0) {
          acc[existedTournamentSeasonIdx].matches.push(match);
        } else {
          acc.push({
            tournament: match.stage.tournamentSeason,
            matches: [match],
          });
        }

        return acc;
      },
      []
    )
    .map<Winner>(({ tournament, matches }) => {
      const finalResults = matches.map<KnockoutStageTableRowResult>(
        ({ hostScore, guestScore, hostPen, guestPen, answer, date }) => ({
          hostScore: answer ? guestScore : hostScore,
          guestScore: answer ? hostScore : guestScore,
          hostPen: answer ? guestPen : hostPen,
          guestPen: answer ? hostPen : guestPen,
          answer,
          date: date ?? "",
        })
      );

      const { stage, forceWinner, host, guest, answer } = {
        ...(matches.length > 0 ? matches[matches.length - 1] : null),
      };

      const winnerInfo = getWinner(
        finalResults,
        !!stage?.stageScheme.awayGoal,
        isNotEmpty(forceWinner)
          ? answer
            ? forceWinner?.id === host?.id
              ? "guest"
              : "host"
            : forceWinner?.id === host?.id
            ? "host"
            : "guest"
          : undefined
      );

      const winner = winnerInfo.host
        ? answer
          ? guest
          : host
        : winnerInfo.guest
        ? answer
          ? host
          : guest
        : undefined;

      const finalist = winnerInfo.host
        ? answer
          ? host
          : guest
        : winnerInfo.guest
        ? answer
          ? guest
          : host
        : undefined;

      const year = tournament.season.split("-")[0];

      return {
        tournament,
        winner: winner
          ? { ...winner, club: prepareClub(winner?.club, year) }
          : undefined,
        finalist: finalist
          ? { ...finalist, club: prepareClub(finalist?.club, year) }
          : undefined,
      };
    });

export const getCVBalance = (cv: ClubCV[] | undefined) => {
  const balance = (cv || []).reduce<Balance>(
    (acc, { balance: { w, d, l, u } }) => {
      acc.w += w;
      acc.d += d;
      acc.l += l;
      acc.u += u;

      return acc;
    },
    { w: 0, d: 0, l: 0, u: 0 }
  );

  return {
    balance,
    matches: balance.w + balance.l + balance.d + balance.u,
  };
};

export const getWinner = (
  results: KnockoutStageTableRowResult[],
  awayGoalRule: boolean,
  forceWinner?: "host" | "guest"
): { host: boolean; guest: boolean } => {
  const totalHostScore = results.reduce<number>(
    (acc, { hostScore, hostPen }) => acc + (hostScore ?? 0) + (hostPen ?? 0),
    0
  );

  const totalGuestScore = results.reduce<number>(
    (acc, { guestScore, guestPen }) =>
      acc + (guestScore ?? 0) + (guestPen ?? 0),
    0
  );

  if (totalHostScore > totalGuestScore) {
    return { host: true, guest: false };
  }

  if (totalGuestScore > totalHostScore) {
    return { host: false, guest: true };
  }

  if (awayGoalRule) {
    const hostAwayGoals =
      results.find((result) => result?.answer === true)?.hostScore ?? 0;

    const guestAwayGoals =
      results.find((result) => result?.answer === false)?.guestScore ?? 0;

    if (hostAwayGoals > guestAwayGoals) {
      return { host: true, guest: false };
    }

    if (guestAwayGoals > hostAwayGoals) {
      return { host: false, guest: true };
    }
  }

  if (forceWinner === "host") {
    return { host: true, guest: false };
  }

  if (forceWinner === "guest") {
    return { host: false, guest: true };
  }

  return { host: false, guest: false };
};
