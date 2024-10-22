import { FC, useState } from "react";
import { Participant, Stage } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { Divider } from "antd";
import classNames from "classnames";
import { SwapOutlined } from "@ant-design/icons";

import { ParticipantsList } from "./components/ParticipantsList";
import { SubstitutionDialog } from "./components/SubstitutionDialog";

import styles from "./styles.module.scss";

export interface ParticipantProps {
  visible: boolean;
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[] | undefined;
  };
  currentStage: Stage;
}

const Participants: FC<ParticipantProps> = ({
  currentStage,
  visible,
  participants,
}) => {
  const { seeded, skippers, previousStageWinners } = participants;
  const { t } = useTranslation();

  const [isSubstitutionsDialogOpen, setIsSubstitutionsDialogOpen] =
    useState(false);

  const stageHasParticipants = Object.values(participants).some(
    (list) => (list?.length || 0) > 0
  );

  return (
    <div
      className={classNames(
        styles.participants,
        styles[currentStage.tournamentSeason.tournament]
      )}
      style={{ display: visible ? "block" : "none" }}
    >
      <h3>
        <span>
          {t("tournament.stages.participants.teams")}
          {": "}
          <span className={styles.num}>
            {(seeded || []).length +
              (previousStageWinners || []).length +
              (skippers || []).length}
          </span>
        </span>
        {stageHasParticipants && (
          <SwapOutlined
            onClick={() => {
              setIsSubstitutionsDialogOpen(true);
            }}
          />
        )}
      </h3>

      <div className={styles.panels}>
        <div className={styles.panel}>
          {(seeded?.length || 0) > 0 && (
            <ParticipantsList
              title={t("tournament.stages.participants.seeded")}
              participants={seeded}
              stage={currentStage}
            />
          )}
        </div>
        <Divider type="vertical" className={styles.divider} />
        <div className={styles.panel}>
          {(previousStageWinners?.length || 0) > 0 && (
            <ParticipantsList
              title={t("tournament.stages.participants.winners")}
              participants={previousStageWinners}
              stage={currentStage}
            />
          )}
          {(skippers?.length || 0) > 0 && (
            <ParticipantsList
              title={t("tournament.stages.participants.skippers")}
              participants={skippers}
              stage={currentStage}
            />
          )}
        </div>
      </div>
      {isSubstitutionsDialogOpen && (
        <SubstitutionDialog
          stage={currentStage}
          stageParticipants={participants}
          currentSubstitutions={currentStage.stageSubstitutions}
          close={() => setIsSubstitutionsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export { Participants };
