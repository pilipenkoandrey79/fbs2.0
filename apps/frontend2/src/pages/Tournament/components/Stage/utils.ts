import {
  GROUP_STAGES,
  Participant,
  Stage,
  StageSchemeType,
  StageSubstitution,
  StageType,
  TournamentPart,
  TournamentStage,
} from "@fbs2.0/types";
import { isLeagueStage, isNotEmpty } from "@fbs2.0/utils";

export const getExistedParticipantsIds = (
  existedMatches: TournamentStage | undefined,
  isKnockoutStage: boolean
) => {
  if (existedMatches === undefined) {
    return [];
  }

  const existedParticipantsIds: number[] = [];

  if (isKnockoutStage) {
    Object.values(existedMatches).forEach(({ tours }) =>
      Object.values(tours).forEach((matches) =>
        matches.forEach(({ host, guest }) => {
          existedParticipantsIds.push(host.id);
          existedParticipantsIds.push(guest.id);
        })
      )
    );

    return existedParticipantsIds;
  }

  Object.values(existedMatches).forEach(({ table }) =>
    table?.forEach(({ team }) => existedParticipantsIds.push(team.id))
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
  previousTournamentPart: TournamentPart | undefined
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
      getSeededParticipants(participants, previousTournamentPart.stage),
      previousTournamentPart?.stage.stageSubstitutions
    ) || [];

  const winners =
    applyStageSubstitutions(
      getPreviousStageWinners(participants, previousTournamentPart),
      previousTournamentPart?.stage.stageSubstitutions
    ) || [];

  const allParticipants = [...seeded, ...winners];

  return allParticipants.reduce<Participant[]>((acc, participant) => {
    if (
      !Object.values(previousTournamentPart?.matches || {}).find(({ tours }) =>
        Object.values(tours).find((item) =>
          item.find(
            ({ host, guest }) =>
              host.id === participant.id || guest.id === participant.id
          )
        )
      )
    ) {
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
  previousTournamentPart: TournamentPart | undefined
) => {
  const previousStageWinnersClubIds: number[] = [];

  Object.values(previousTournamentPart?.matches || {}).forEach(
    ({ table, tours }) => {
      if (
        previousTournamentPart?.stage.stageType === StageType.GROUP ||
        previousTournamentPart?.stage.stageType === StageType.GROUP_2 ||
        previousTournamentPart?.stage.stageType === StageType.LEAGUE
      ) {
        return table
          ?.slice(
            0,
            getGroupWinnersQuantity(
              previousTournamentPart?.stage.stageScheme.type
            )
          )
          .forEach(
            ({ team }) =>
              isNotEmpty(team) &&
              previousStageWinnersClubIds.push(team?.club.id)
          );
      } else {
        return Object.values(tours).forEach((item) =>
          item.forEach(({ host, guest }) => {
            if (host.isWinner) {
              previousStageWinnersClubIds.push(host.club.id);
            }

            if (guest.isWinner) {
              previousStageWinnersClubIds.push(guest.club.id);
            }
          })
        );
      }
    }
  );

  return participants?.filter(({ club }) =>
    previousStageWinnersClubIds.includes(club.id)
  );
};

export const getFilteredParticipants = (
  seededParticipants: Participant[] | undefined,
  previousStageWinners: Participant[] | undefined,
  skippers: Participant[],
  currentTournamentPart: TournamentPart
) => {
  const existedParticipantsIds = getExistedParticipantsIds(
    currentTournamentPart.matches,
    ![...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
      currentTournamentPart.stage.stageScheme.type
    )
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
  currentTournamentPart: TournamentPart,
  previousTournamentPart: TournamentPart | undefined
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
