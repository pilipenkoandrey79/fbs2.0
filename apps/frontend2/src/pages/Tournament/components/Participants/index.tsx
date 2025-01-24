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
import { StageType, Tournament } from "@fbs2.0/types";
import { getWinner, isNotEmpty } from "@fbs2.0/utils";

import { AddForm } from "./components/AddForm";
import { Fallback } from "../../../../components/Fallback";
import { ParticipantsList } from "./components/ParticipantsList";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { useTransferParticipants } from "../../../../react-query-hooks/participant/useTransferParticipants";
import { useLoadParticipants } from "../../../../react-query-hooks/participant/useLoadParticipants";
import { useGetTournamentPartMatches } from "../../../../react-query-hooks/match/useGetTournamentPartMatches";
import { useGetTournamentStages } from "../../../../react-query-hooks/tournament/useGetTournamentStages";
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
  const { data: availableTournaments } = useGetTournamentSeasons();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number>();

  const hasLinkedTournament =
    availableTournaments?.[season ?? ""]?.find(
      (availableTournament) => tournament === availableTournament.type,
    )?.hasLinkedTournaments || false;

  const transferParticipants = useTransferParticipants();
  const loadParticipants = useLoadParticipants();
  const stages = useGetTournamentStages(season, tournament as Tournament);

  const finalMatches = useGetTournamentPartMatches(
    season,
    tournament as Tournament,
    stages.data?.find(({ stageType }) => stageType === StageType.FINAL) ?? null,
  );

  const { results, forceWinnerId, host } = {
    ...finalMatches.data?.A?.tours?.["1"]?.[0],
  };

  const winnerInfo = getWinner(
    results || [],
    !!stages.data?.find(({ stageType }) => stageType === StageType.FINAL)
      ?.stageScheme.awayGoal,
    isNotEmpty(forceWinnerId)
      ? forceWinnerId === host?.id
        ? "guest"
        : "host"
      : undefined,
  );

  const finished = winnerInfo.host || winnerInfo.guest;

  const transfer = async () => {
    const count = await transferParticipants.mutateAsync();

    toast.success(
      t(
        `tournament.participants.list.${count === 0 ? "zero_" : ""}transfered`,
        { count, season, tournament },
      ),
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
            {user?.isEditor && !finished && (
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
                    year={season?.split("-")[0]}
                  />
                )}
              </div>
            )}
            <ParticipantsList
              participants={participants.data}
              loading={participants.isLoading}
              adding={isAddFormOpen}
              finished={finished}
              setSelectedCountryId={setSelectedCountryId}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export { Participants };
