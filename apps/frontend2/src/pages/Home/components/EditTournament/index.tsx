import { TournamentSeason } from "@fbs2.0/types";
import { FC } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { getTournamentTitle } from "@fbs2.0/utils";
import classNames from "classnames";

import { StageItem } from "./components/StageItem";
import { AppendStage } from "./components/AppendStage";
import { useGetTournamentStages } from "../../../../react-query-hooks/tournament/useGetTournamentStages";

import styles from "./style.module.scss";

interface Props {
  tournamentSeason: TournamentSeason;
  onClose: () => void;
}

const EditTournament: FC<Props> = ({ tournamentSeason, onClose }) => {
  const { t } = useTranslation();

  const stages = useGetTournamentStages(
    tournamentSeason.season,
    tournamentSeason.tournament,
    false
  );

  return (
    <Modal
      open
      className={styles.modal}
      title={`${t(getTournamentTitle(tournamentSeason))} ${
        tournamentSeason.season
      }`}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div
        className={classNames(
          styles.content,
          styles[`edit-${tournamentSeason.tournament}`]
        )}
      >
        {stages.data?.map((stage, index) => (
          <StageItem
            stage={stage}
            index={index}
            key={stage.id}
            tournamentSeason={tournamentSeason}
          />
        ))}
        {stages.data?.[stages.data?.length - 1]?.stageType !== undefined && (
          <AppendStage
            tournamentSeason={tournamentSeason}
            lastStageType={stages.data?.[stages.data?.length - 1]?.stageType}
          />
        )}
      </div>
    </Modal>
  );
};

export { EditTournament };
