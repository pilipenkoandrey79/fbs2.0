import {
  Group,
  GROUP_STAGES,
  GroupRow,
  LeagueStageData,
  Participant,
  Stage,
  StageSchemeType,
  StageSubstitution,
  StageTableRow,
  StageType,
  TournamentDataRow,
} from "@fbs2.0/types";
import { isLeagueStage, isNotEmpty } from "@fbs2.0/utils";

export const getExistedParticipantsIds = (
  existedMatches: TournamentDataRow["matches"] | undefined
) => {
  if (
    existedMatches === undefined ||
    (existedMatches as LeagueStageData).table
  ) {
    return [];
  }

  if (Array.isArray(existedMatches)) {
    return (
      (existedMatches as StageTableRow[]).reduce<number[]>(
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
  participants: Participant[] | undefined,
  stageSubstitutions: StageSubstitution[] | undefined
) =>
  (stageSubstitutions?.length || 0) > 0
    ? participants?.map((participant) => {
        const substitution = stageSubstitutions?.find(
          ({ expelled }) => expelled.id === participant.id
        );

        return substitution ? substitution.sub : participant;
      })
    : participants;

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

const getParticipantsSkippedPreviousStage = (
  participants: Participant[] | undefined,
  currentStage: Stage,
  previousTournamentPart: TournamentDataRow | undefined
) => {
  if (
    !previousTournamentPart?.stage ||
    GROUP_STAGES.includes(previousTournamentPart?.stage.stageScheme.type) ||
    isLeagueStage(previousTournamentPart.stage)
  ) {
    return [];
  }

  const seeded =
    applyStageSubstitutions(
      getSeededParticipants(participants, currentStage),
      previousTournamentPart?.stage.stageSubstitutions
    ) || [];

  const winners =
    applyStageSubstitutions(
      getPreviousStageWinners(participants, previousTournamentPart),
      previousTournamentPart?.stage.stageSubstitutions
    ) || [];

  const allParticipants = [...seeded, ...winners];

  return allParticipants.reduce<Participant[]>((acc, participant) => {
    const match = (previousTournamentPart.matches as StageTableRow[]).find(
      ({ host, guest }) =>
        host.id === participant.id || guest.id === participant.id
    );

    if (!match) {
      acc.push(participant);
    }

    return acc;
  }, []);
};

const getSeededParticipants = (
  participants: Participant[] | undefined,
  currentStage: Stage
) =>
  participants?.filter(
    ({ startingStage }) => startingStage === currentStage.stageType
  );

const getPreviousStageWinners = (
  participants: Participant[] | undefined,
  previousTournamentPart: TournamentDataRow | undefined
) => {
  const previousStageWinnersClubIds: number[] = [];

  if (
    previousTournamentPart?.stage.stageType === StageType.GROUP ||
    previousTournamentPart?.stage.stageType === StageType.GROUP_2
  ) {
    Object.values(
      previousTournamentPart.matches as Record<Group, GroupRow[]>
    ).forEach((tableRows) =>
      tableRows
        .slice(
          0,
          getGroupWinnersQuantity(
            previousTournamentPart?.stage.stageScheme.type
          )
        )
        .forEach(
          ({ team }) =>
            isNotEmpty(team) && previousStageWinnersClubIds.push(team?.club.id)
        )
    );
  } else if (previousTournamentPart?.stage.stageType === StageType.LEAGUE) {
    (previousTournamentPart.matches as LeagueStageData).table
      .slice(
        0,
        getGroupWinnersQuantity(previousTournamentPart?.stage.stageScheme.type)
      )
      .forEach(
        ({ team }) =>
          isNotEmpty(team) && previousStageWinnersClubIds.push(team?.club.id)
      );
  } else {
    (previousTournamentPart?.matches as StageTableRow[])?.forEach(
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

  return participants?.filter(({ club }) =>
    previousStageWinnersClubIds.includes(club.id)
  );
};

export const getFilteredParticipants = (
  seededParticipants: Participant[] | undefined,
  previousStageWinners: Participant[] | undefined,
  skippers: Participant[],
  currentTournamentPart: TournamentDataRow
) => {
  const existedParticipantsIds = getExistedParticipantsIds(
    currentTournamentPart.matches
  );

  return [
    ...(applyStageSubstitutions(
      seededParticipants,
      currentTournamentPart.stage.stageSubstitutions
    ) || []),
    ...(applyStageSubstitutions(
      previousStageWinners,
      currentTournamentPart.stage.stageSubstitutions
    ) || []),
    ...(applyStageSubstitutions(
      skippers,
      currentTournamentPart.stage.stageSubstitutions
    ) || []),
  ].filter(({ id }) => !existedParticipantsIds.includes(id));
};

export const prepareStageParticipants = (
  participants: Participant[] | undefined,
  currentTournamentPart: TournamentDataRow,
  previousTournamentPart: TournamentDataRow | undefined
) => {
  const seeded = getSeededParticipants(
    participants,
    currentTournamentPart.stage
  );

  const previousStageWinners = getPreviousStageWinners(
    participants,
    previousTournamentPart
  );

  const skippers = getParticipantsSkippedPreviousStage(
    participants,
    currentTournamentPart.stage,
    previousTournamentPart
  );

  return {
    seeded,
    previousStageWinners,
    skippers,
    filtered: getFilteredParticipants(
      seeded,
      previousStageWinners,
      skippers,
      currentTournamentPart
    ),
  };
};
