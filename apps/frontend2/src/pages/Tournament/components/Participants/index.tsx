import { Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useMediaQuery } from "react-responsive";

import { Fallback } from "../../../../components/Fallback";
import { ParticipantsList } from "./components/ParticipantsList";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";

import styles from "./style.module.scss";
import variables from "../../../../style/variables.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Participants: FC<Props> = ({ open, onClose }) => {
  const { season, tournament } = useParams();
  const { t } = useTranslation();

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const participants = useGetParticipants(season, tournament);

  return (
    <Modal
      open={open}
      className={styles.modal}
      title={t("tournament.participants.title")}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        {participants.isLoading ? (
          <Fallback />
        ) : (
          <div className={styles.list}>
            <ParticipantsList
              participants={participants.data}
              condensed={!isMdScreen}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export { Participants };
