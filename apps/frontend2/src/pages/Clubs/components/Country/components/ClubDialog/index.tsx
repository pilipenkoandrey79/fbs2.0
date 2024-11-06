import { Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";

interface Props {
  id: number;
  onClose: () => void;
}

const ClubDialog: FC<Props> = ({ onClose, id }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open
      className={styles.modal}
      title={t(`clubs.club.title.${id === -1 ? "create" : "edit"}`)}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}></div>
    </Modal>
  );
};

export { ClubDialog };
