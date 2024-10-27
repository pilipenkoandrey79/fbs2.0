import { TournamentSeason } from "@fbs2.0/types";
import { FC } from "react";
import { Form, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { getTournamentTitle } from "@fbs2.0/utils";

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
      <div className={styles.content}>
        {stages.data?.map((stage) => (
          <Form>{stage.stageType}</Form>
        ))}
      </div>
    </Modal>
  );
};

export { EditTournament };
