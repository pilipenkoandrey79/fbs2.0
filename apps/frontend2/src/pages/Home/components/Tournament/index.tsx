import { TournamentSeason } from "@fbs2.0/types";
import { Modal } from "antd";
import { FC } from "react";

import styles from "./style.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  tournamentSeason: TournamentSeason;
  onClose: () => void;
}

const Tournament: FC<Props> = ({ tournamentSeason, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open
      className={styles.modal}
      title={t("tournament.participants.title")}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>Tournament</div>
    </Modal>
  );
};

export { Tournament };
