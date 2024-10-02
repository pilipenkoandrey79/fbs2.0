import {
  Club,
  GROUP_STAGES,
  Group,
  GroupRow,
  _KnockoutStageTableRowResult,
  _LeagueStageData,
  Participant,
  Stage,
  StageSchemeType,
  StageSubstitution,
  _StageTableData,
  _StageTableRow,
  StageType,
  _TournamentDataRow,
} from "@fbs2.0/types";
import { isLeagueStage, isNotEmpty, prepareClub } from "@fbs2.0/utils";

export const prepareClubs = (clubs: Club[], year?: string) =>
  isNotEmpty(year)
    ? clubs.map((club) => prepareClub(club, year as string))
    : clubs;

const sortByClubName = (a: Participant, b: Participant) => {
  const collator = new Intl.Collator("uk");

  return collator.compare(a.club.name, b.club.name);
};

export const getResultsInPair = (
  match: _StageTableRow | undefined,
  columnIndex: number
) => {
  type resultsType = {
    result: _KnockoutStageTableRowResult | undefined;
    anotherResult: _KnockoutStageTableRowResult | undefined;
  };

  return (
    match?.results.reduce<resultsType>(
      (acc, item, index) => {
        if (isNotEmpty(item)) {
          if (index === columnIndex) {
            acc.result = item;
          } else {
            acc.anotherResult = item;
          }
        }

        return acc;
      },
      {
        result: undefined,
        anotherResult: undefined,
      }
    ) || ({} as resultsType)
  );
};

export const getSeededParticipants = (
  currentStage: Stage,
  participants: Participant[]
) =>
  participants
    .filter(({ startingStage }) => startingStage === currentStage.stageType)
    .sort(sortByClubName);

export const getGroupWinnersQuantity = (stageSchemeType: StageSchemeType) => {
  if (stageSchemeType === StageSchemeType.GROUP_4_2_MATCH) {
    return 2;
  }

  if (stageSchemeType === StageSchemeType.GROUP_5_1_MATCH) {
    return 3;
  }

  if (stageSchemeType === StageSchemeType.LEAGUE) {
    return 24;
  }

  return 1;
};

export const getPreviousStageWinners = (
  currentStage: Stage,
  participants: Participant[],
  matchesBystages: _TournamentDataRow[]
) => {
  const previousStage =
    currentStage.previousStage === null
      ? undefined
      : matchesBystages.find(
          ({ stage }) => stage.id === currentStage.previousStage?.id
        );

  const previousStageWinnersClubIds: number[] = [];

  if (
    previousStage?.stage.stageType === StageType.GROUP ||
    previousStage?.stage.stageType === StageType.GROUP_2
  ) {
    Object.values(previousStage.matches as Record<Group, GroupRow[]>).forEach(
      (tableRows) =>
        tableRows
          .slice(
            0,
            getGroupWinnersQuantity(previousStage?.stage.stageScheme.type)
          )
          .forEach(
            ({ team }) =>
              isNotEmpty(team) &&
              previousStageWinnersClubIds.push(team?.club.id)
          )
    );
  } else if (previousStage?.stage.stageType === StageType.LEAGUE) {
    (previousStage.matches as _LeagueStageData).table
      .slice(0, getGroupWinnersQuantity(previousStage?.stage.stageScheme.type))
      .forEach(
        ({ team }) =>
          isNotEmpty(team) && previousStageWinnersClubIds.push(team?.club.id)
      );
  } else {
    ((previousStage?.matches as _StageTableData)?.rows || []).forEach(
      ({ host, guest }) => {
        if (host.isWinner) {
          previousStageWinnersClubIds.push(host.club.id);
        }

        if (guest.isWinner) {
          previousStageWinnersClubIds.push(guest.club.id);
        }
      }
    );
  }

  return participants
    .filter(({ club }) => previousStageWinnersClubIds.includes(club.id))
    .sort(sortByClubName);
};

export const getExistedParticipantsIds = (
  existedMatches: _TournamentDataRow["matches"] | undefined
) => {
  if (
    existedMatches === undefined ||
    (existedMatches as _LeagueStageData).table
  ) {
    return [];
  }

  if (Array.isArray((existedMatches as _StageTableData)?.rows)) {
    return (
      (existedMatches as _StageTableData)?.rows?.reduce<number[]>(
        (acc, { host, guest }) => [...acc, host.id, guest.id],
        []
      ) || []
    );
  }

  const existedParticipantsIds: number[] = [];

  Object.values(existedMatches as Record<Group, GroupRow[]>).forEach((rows) =>
    rows.forEach(({ team }) => existedParticipantsIds.push(team.id))
  );

  return existedParticipantsIds;
};

export const applyStageSubstitutions = (
  participants: Participant[],
  stageSubstitutions: StageSubstitution[]
) =>
  stageSubstitutions.length > 0
    ? participants.map((participant) => {
        const substitution = stageSubstitutions.find(
          ({ expelled }) => expelled.id === participant.id
        );

        return substitution ? substitution.sub : participant;
      })
    : participants;

export const getFilteredParticipants = (
  seededParticipants: Participant[],
  previousStageWinners: Participant[],
  currentStage: Stage,
  matchesBystages: _TournamentDataRow[],
  participantsSkippedPreviousStage: Participant[]
) => {
  const existedMatches = matchesBystages.find(
    (item) => item.stage.id === currentStage.id
  )?.matches;

  const existedParticipantsIds = getExistedParticipantsIds(existedMatches);

  const participants = [
    ...applyStageSubstitutions(
      seededParticipants,
      currentStage.stageSubstitutions || []
    ),
    ...applyStageSubstitutions(
      previousStageWinners,
      currentStage.stageSubstitutions || []
    ),
    ...applyStageSubstitutions(
      participantsSkippedPreviousStage,
      currentStage.stageSubstitutions || []
    ),
  ].filter(({ id }) => !existedParticipantsIds.includes(id));

  return participants.sort(sortByClubName);
};

export const playedMatchesOfGroup = (tableRows: GroupRow[]) =>
  tableRows
    .map(({ chessCells }) =>
      chessCells.map(({ match }) => match).filter((match) => isNotEmpty(match))
    )
    .flat();

export const getParticipantsSkippedPreviousStage = (
  currentStage: Stage,
  participants: Participant[],
  matchesBystages: _TournamentDataRow[]
) => {
  const prevStage =
    currentStage.previousStage === null
      ? undefined
      : matchesBystages.find(
          ({ stage }) => stage.id === currentStage.previousStage?.id
        );

  if (
    !prevStage ||
    GROUP_STAGES.includes(prevStage.stage.stageScheme.type) ||
    isLeagueStage(prevStage.stage)
  ) {
    return [];
  }

  const { stage: previousStage, matches: previousStageMatches } = prevStage;

  const seeded = applyStageSubstitutions(
    getSeededParticipants(previousStage, participants),
    previousStage.stageSubstitutions || []
  );

  const winners = applyStageSubstitutions(
    getPreviousStageWinners(previousStage, participants, matchesBystages),
    previousStage.stageSubstitutions || []
  );

  const allParticipants = [...seeded, ...winners];

  return allParticipants
    .reduce<Participant[]>((acc, participant) => {
      const match = (previousStageMatches as _StageTableData).rows.find(
        ({ host, guest }) =>
          host.id === participant.id || guest.id === participant.id
      );

      if (!match) {
        acc.push(participant);
      }

      return acc;
    }, [])
    .sort(sortByClubName);
};
