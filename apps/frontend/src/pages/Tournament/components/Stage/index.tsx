import {
  Group,
  GroupRow,
  Participant,
  StageSchemeType,
  StageTableData,
  Tournament,
  TournamentDataRow,
  Stage as StageIntrface,
  UKRAINE,
  USSR,
  GROUP_STAGES,
  LeagueStageData,
} from "@fbs2.0/types";
import { FC, useContext, useMemo, useState } from "react";
import { isLeagueStage, isNotEmpty } from "@fbs2.0/utils";
import { Button } from "@blueprintjs/core";
import classNames from "classnames";

import { StageProps } from "../../types";
import {
  getFilteredParticipants,
  getParticipantsSkippedPreviousStage,
  getPreviousStageWinners,
  getSeededParticipants,
} from "../../utils";
import GroupStage from "../GroupStage";
import { KnockoutStage } from "../KnockoutStage";
import { StageParticipant } from "./components/StageParticipant";
import { SubstitutionDialog } from "./components/SubstitutionDialog";
import { UserContext } from "../../../../context/userContext";
import { LeagueStage } from "../LeagueStage";

import styles from "./styles.module.scss";

interface Props extends StageProps {
  matchesBystages: TournamentDataRow[] | undefined;
  index: number;
}

const getParticipantClasses = (
  participant: Participant,
  tournament: Tournament,
  highlightedClubId: number | undefined
) =>
  classNames({
    [styles["from-another-tournament"]]: isNotEmpty(participant.fromStage),
    [styles.mine]: [UKRAINE, USSR].includes(participant.club.city.country.name),
    [styles[`highlighted-${tournament}`]]:
      participant.club.id === highlightedClubId,
  });

const Stage: FC<Props> = ({
  matchesBystages = [],
  participants,
  index,
  version,
  isRefetching,
  highlightedClubId,
}) => {
  const { user } = useContext(UserContext);

  const { stage, matches } = matchesBystages[index];

  const [isSubstitutionDialogOpen, setIsSubstitutionDialogOpen] =
    useState(false);

  const seededParticipants = useMemo(
    () => getSeededParticipants(stage, participants),
    [participants, stage]
  );

  const previousStageWinners = useMemo(
    () => getPreviousStageWinners(stage, participants, matchesBystages),
    [matchesBystages, participants, stage]
  );

  const skippers = useMemo(
    () =>
      getParticipantsSkippedPreviousStage(stage, participants, matchesBystages),
    [matchesBystages, participants, stage]
  );

  const stageParticipants = useMemo(
    () =>
      getFilteredParticipants(
        seededParticipants,
        previousStageWinners,
        stage,
        matchesBystages,
        skippers
      ),
    [matchesBystages, previousStageWinners, seededParticipants, skippers, stage]
  );

  const props: StageProps & { stage: StageIntrface } = {
    stage,
    participants: stageParticipants,
    highlightedClubId,
    version,
    isRefetching,
  };

  const toggleSubstitutionDialog = () => {
    setIsSubstitutionDialogOpen(!isSubstitutionDialogOpen);
  };

  const widePanel = stage.stageScheme.type === StageSchemeType.GROUP_5_1_MATCH;

  return (
    <div className={styles.stage}>
      <div className={styles["stage-header"]}>
        <h3>{stage.label || stage.stageType}</h3>
        {user?.isEditor && (
          <Button
            small
            minimal
            text="Замінити учасника"
            onClick={toggleSubstitutionDialog}
          />
        )}
      </div>
      {isSubstitutionDialogOpen && (
        <SubstitutionDialog
          onClose={toggleSubstitutionDialog}
          stageId={stage.id}
          stageParticipants={stageParticipants}
          allParticipants={participants}
        />
      )}
      <div className={styles["stage-container"]}>
        <div
          className={classNames(styles["stage-participants"], {
            [styles["stage-participants-wide"]]: widePanel,
          })}
        >
          {seededParticipants.length > 0 && (
            <div className={styles.seeded}>
              <h4>Сіяні учасники</h4>
              <ol>
                {seededParticipants.map((participant) => (
                  <StageParticipant
                    key={participant.id}
                    stage={stage}
                    participant={participant}
                    className={getParticipantClasses(
                      participant,
                      stage.tournamentSeason.tournament,
                      highlightedClubId
                    )}
                  />
                ))}
              </ol>
            </div>
          )}
          {isNotEmpty(stage.previousStage) && (
            <div className={styles.winners}>
              <h4>Переможці попередньої стадії</h4>
              <ol>
                {previousStageWinners.map((participant) => (
                  <StageParticipant
                    key={participant.id}
                    stage={stage}
                    participant={participant}
                    className={getParticipantClasses(
                      participant,
                      stage.tournamentSeason.tournament,
                      highlightedClubId
                    )}
                  />
                ))}
              </ol>
              {skippers.length > 0 && (
                <>
                  <h4>Пропустили попередню стадію</h4>
                  <ol>
                    {skippers.map((participant) => (
                      <StageParticipant
                        key={participant.id}
                        stage={stage}
                        participant={participant}
                        className={getParticipantClasses(
                          participant,
                          stage.tournamentSeason.tournament,
                          highlightedClubId
                        )}
                      />
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
        </div>
        <div
          className={classNames(styles["stage-table"], {
            [styles["stage-table-wide"]]: widePanel,
          })}
        >
          {GROUP_STAGES.includes(stage.stageScheme.type) ? (
            <GroupStage
              {...props}
              matches={matches as Record<Group, GroupRow[]>}
            />
          ) : isLeagueStage(stage) ? (
            <LeagueStage {...props} matches={matches as LeagueStageData} />
          ) : (
            <KnockoutStage {...props} matches={matches as StageTableData} />
          )}
        </div>
      </div>
    </div>
  );
};

export { Stage };
