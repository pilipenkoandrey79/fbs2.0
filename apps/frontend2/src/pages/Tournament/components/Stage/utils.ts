import {
  Group,
  GROUP_STAGES,
  Participant,
  Stage,
  StageSchemeType,
  StageSubstitution,
  StageType,
  TournamentPart,
} from "@fbs2.0/types";
import { isLeagueStage, isNotEmpty } from "@fbs2.0/utils";

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
    return 8;
  }

  return 1;
};

const getParticipantsSkippedPreviousStage = (
  participants: Participant[] | undefined,
  previousTournamentPart: TournamentPart | undefined,
  prePreviousTournamentPart: TournamentPart | undefined
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
      getPreviousStageWinners(participants, prePreviousTournamentPart),
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
  skippers: Participant[] | undefined,
  currentTournamentPart: TournamentPart,
  group: Group | undefined,
  tour: number | undefined
) => {
  const existedParticipantsIds =
    currentTournamentPart.matches === undefined
      ? []
      : Object.values(currentTournamentPart.matches).reduce<number[]>(
          (acc, { tours }) => {
            Object.values(tours).forEach((matches) =>
              matches.forEach(({ host, guest }) => [...acc, host.id, guest.id])
            );

            return acc;
          },
          []
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
  previousTournamentPart: TournamentPart | undefined,
  prePreviousTournamentPart: TournamentPart | undefined
) => ({
  seeded: getSeededParticipants(participants, currentTournamentPart.stage),
  previousStageWinners: getPreviousStageWinners(
    participants,
    previousTournamentPart
  ),
  skippers: getParticipantsSkippedPreviousStage(
    participants,
    previousTournamentPart,
    prePreviousTournamentPart
  ),
});

export const getPreviousTournamentPart = (
  matches: TournamentPart[],
  stage: Stage | undefined
) =>
  isNotEmpty(stage?.previousStage)
    ? matches.find((entry) => entry.stage.id === stage?.previousStage?.id)
    : undefined;
