import { FC } from "react";
import { Participant, Stage } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { Divider } from "antd";

import { ParticipantsList } from "./components/ParticipantsList";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  seeded: Participant[] | undefined;
  previousStageWinners: Participant[] | undefined;
  skippers: Participant[] | undefined;
  currentStage: Stage;
  highlightedClubId: number | null;
}

const Participants: FC<Props> = ({
  currentStage,
  seeded,
  previousStageWinners,
  skippers,
  highlightedClubId,
  visible,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={styles.participants}
      style={{ display: visible ? "block" : "none" }}
    >
      <h3>{`${t("tournament.stages.participants.teams")}: ${
        (seeded || []).length +
        (previousStageWinners || []).length +
        (skippers || []).length
      }`}</h3>
      <div className={styles.panels}>
        <div className={styles.panel}>
          {(seeded?.length || 0) > 0 && (
            <ParticipantsList
              title={t("tournament.stages.participants.seeded")}
              participants={seeded}
              stage={currentStage}
              highlightedClubId={highlightedClubId}
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
              highlightedClubId={highlightedClubId}
            />
          )}
          {(skippers?.length || 0) > 0 && (
            <ParticipantsList
              title={t("tournament.stages.participants.skippers")}
              participants={skippers}
              stage={currentStage}
              highlightedClubId={highlightedClubId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { Participants };
