import { Button, Modal } from "antd";
import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import {
  AppstoreAddOutlined,
  CloseOutlined,
  FileAddOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

import { AddForm } from "./components/AddForm";
import { Fallback } from "../../../../components/Fallback";
import { ParticipantsList } from "./components/ParticipantsList";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { useTransferParticipants } from "../../../../react-query-hooks/participant/useTransferParticipants";
import { useLoadParticipants } from "../../../../react-query-hooks/participant/useLoadParticipants";
import { UserContext } from "../../../../context/userContext";

import styles from "./style.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Participants: FC<Props> = ({ open, onClose }) => {
  const { season, tournament } = useParams();
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const participants = useGetParticipants(season, tournament);
  const { data: availableTournaments } = useGetTournamentSeasons(true);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number>();

  const hasLinkedTournament =
    availableTournaments?.[season ?? ""]?.find(
      (availableTournament) => tournament === availableTournament.type
    )?.hasLinkedTournaments || false;

  const transferParticipants = useTransferParticipants();
  const loadParticipants = useLoadParticipants();

  const transfer = async () => {
    const count = await transferParticipants.mutateAsync();

    toast.success(
      t(
        `tournament.participants.list.${count === 0 ? "zero_" : ""}transfered`,
        { count, season, tournament }
      )
    );
  };

  const load = async () => {
    const count = await loadParticipants.mutateAsync();
    toast.success(t("tournament.participants.list.loaded", { count }));
  };

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
                <div className={styles.buttons}>
                  <Button
                    type="primary"
                    size="small"
                    icon={
                      isAddFormOpen ? (
                        <CloseOutlined />
                      ) : (
                        <AppstoreAddOutlined />
                      )
                    }
                    title={t("tournament.participants.list.add")}
                    onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                  />
                  <div className={styles["additional-buttons"]}>
                    {hasLinkedTournament && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<FileAddOutlined />}
                        title={t("tournament.participants.list.transfer")}
                        disabled={
                          transferParticipants.isPending || isAddFormOpen
                        }
                        loading={transferParticipants.isPending}
                        onClick={transfer}
                      />
                    )}
                    {participants.data?.length === 0 && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<ImportOutlined />}
                        title={t("tournament.participants.list.load")}
                        disabled={loadParticipants.isPending || isAddFormOpen}
                        loading={loadParticipants.isPending}
                        onClick={load}
                      />
                    )}
                  </div>
                </div>
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
