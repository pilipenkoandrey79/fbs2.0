import { Button, Modal } from "antd";
import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useMediaQuery } from "react-responsive";
import { AppstoreAddOutlined, CloseOutlined } from "@ant-design/icons";

import { AddForm } from "./components/AddForm";
import { Fallback } from "../../../../components/Fallback";
import { ParticipantsList } from "./components/ParticipantsList";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { UserContext } from "../../../../context/userContext";

import styles from "./style.module.scss";
import variables from "../../../../style/variables.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Participants: FC<Props> = ({ open, onClose }) => {
  const { season, tournament } = useParams();
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const participants = useGetParticipants(season, tournament);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number>();

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
            {user?.isEditor && (
              <div className={styles["add-form"]}>
                <Button
                  type="primary"
                  size="small"
                  icon={
                    isAddFormOpen ? <CloseOutlined /> : <AppstoreAddOutlined />
                  }
                  title={t("tournament.participants.list.add")}
                  onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                />
                {isAddFormOpen && (
                  <AddForm
                    close={() => setIsAddFormOpen(false)}
                    selectedCountryId={selectedCountryId}
                  />
                )}
              </div>
            )}
            <ParticipantsList
              participants={participants.data}
              condensed={!isMdScreen}
              adding={isAddFormOpen}
              setSelectedCountryId={setSelectedCountryId}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export { Participants };
