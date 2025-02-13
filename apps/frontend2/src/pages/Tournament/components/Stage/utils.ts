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
import { getNumGroupRows, isLeagueStage, isNotEmpty } from "@fbs2.0/utils";

export const applyStageSubstitutions = (
  participants: Participant[] | undefined,
  stageSubstitutions: StageSubstitution[] | undefined,
) =>
  (stageSubstitutions?.length || 0) > 0
    ? participants?.map((participant) => {
        const substitution = stageSubstitutions?.find(
          ({ expelled }) => expelled.id === participant.id,
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
  prePreviousTournamentPart: TournamentPart | undefined,
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
      previousTournamentPart?.stage.stageSubstitutions,
    ) || [];

  const winners =
    applyStageSubstitutions(
      getPreviousStageWinners(participants, prePreviousTournamentPart),
      previousTournamentPart?.stage.stageSubstitutions,
    ) || [];

  const allParticipants = [...seeded, ...winners];

  return allParticipants.reduce<Participant[]>((acc, participant) => {
    if (
      !Object.values(previousTournamentPart?.matches || {}).find(({ tours }) =>
        Object.values(tours).find((item) =>
          item.find(
            ({ host, guest }) =>
              host.id === participant.id || guest.id === participant.id,
          ),
        ),
      )
    ) {
      acc.push(participant);
    }

    return acc;
  }, []);
};

const getSeededParticipants = (
  participants: Participant[] | undefined,
  currentStage: Stage | undefined,
) =>
  participants?.filter(
    ({ startingStage, fromStage }) =>
      startingStage === currentStage?.stageType ||
      fromStage?.linkedTournamentStage === currentStage?.stageType,
  );

const getPreviousStageWinners = (
  participants: Participant[] | undefined,
  previousTournamentPart: TournamentPart | undefined,
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
              previousTournamentPart?.stage.stageScheme.type,
            ) *
              (previousTournamentPart?.stage.stageType === StageType.LEAGUE
                ? 3
                : 1),
          )
          .forEach(
            ({ team }) =>
              isNotEmpty(team) &&
              previousStageWinnersClubIds.push(team?.club.id),
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
          }),
        );
      }
    },
  );

  return participants?.filter(({ club }) =>
    previousStageWinnersClubIds.includes(club.id),
  );
};

export const getStageParticipants = (
  seededParticipants: Participant[] | undefined,
  previousStageWinners: Participant[] | undefined,
  skippers: Participant[] | undefined,
  substitutions: StageSubstitution[] | undefined,
) => [
  ...(applyStageSubstitutions(seededParticipants, substitutions) || []),
  ...(applyStageSubstitutions(previousStageWinners, substitutions) || []),
  ...(applyStageSubstitutions(skippers, substitutions) || []),
];

export const getFilteredParticipants = (
  seededParticipants: Participant[] | undefined,
  previousStageWinners: Participant[] | undefined,
  skippers: Participant[] | undefined,
  currentTournamentPart: TournamentPart,
  group: Group | undefined,
  tour: number | undefined,
) => {
  const usedParticipantsIds =
    currentTournamentPart.matches?.[group as Group]?.tours?.[tour || 1].reduce<
      number[]
    >((acc, { host, guest }) => [...acc, host.id, guest.id], []) || [];

  if (
    usedParticipantsIds.length >=
    getNumGroupRows(currentTournamentPart.stage.stageScheme.type)
  ) {
    return [];
  }

  const usedParticipantsIdsInOtherGroups = Object.keys(
    currentTournamentPart.matches,
  )
    .filter((key) => key.toString() !== group?.toString())
    .reduce<number[]>((acc, group) => {
      currentTournamentPart.matches[group as Group].table?.forEach(
        ({ team }) => {
          acc.push(team.id);
        },
      );

      return acc;
    }, []);

  const allParticipants =
    (currentTournamentPart.matches?.[group as Group]?.table?.length || 0) >=
    getNumGroupRows(currentTournamentPart.stage.stageScheme.type)
      ? currentTournamentPart.matches?.[group as Group].table?.map(
          ({ team }) => team,
        )
      : getStageParticipants(
          seededParticipants,
          previousStageWinners,
          skippers,
          currentTournamentPart.stage.stageSubstitutions,
        );

  return (
    allParticipants?.filter(
      ({ id }) =>
        ![...usedParticipantsIds, ...usedParticipantsIdsInOtherGroups].includes(
          id,
        ),
    ) || []
  );
};

export const prepareStageParticipants = (
  participants: Participant[] | undefined,
  currentTournamentPart: TournamentPart | undefined,
  previousTournamentPart: TournamentPart | undefined,
  prePreviousTournamentPart: TournamentPart | undefined,
) => ({
  seeded: getSeededParticipants(participants, currentTournamentPart?.stage),
  previousStageWinners: getPreviousStageWinners(
    participants,
    previousTournamentPart,
  ),
  skippers: getParticipantsSkippedPreviousStage(
    participants,
    previousTournamentPart,
    prePreviousTournamentPart,
  ),
});

export const getPreviousTournamentPart = (
  matches: TournamentPart[],
  stage: Stage | undefined,
) =>
  isNotEmpty(stage?.previousStage)
    ? matches.find((entry) => entry.stage.id === stage?.previousStage?.id)
    : undefined;
