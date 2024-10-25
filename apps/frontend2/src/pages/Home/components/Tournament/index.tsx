import { TournamentDto, TournamentSeason, Years } from "@fbs2.0/types";
import { Divider, Form, Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { getTournamentTitle } from "@fbs2.0/utils";

import { TournamentSelector } from "./component/TournamentSelector";
import { SeasonInput } from "./component/SeasonInput";

import styles from "./style.module.scss";

interface Props {
  tournamentSeason: TournamentSeason | Record<string, never>;
  onClose: () => void;
}

const Tournament: FC<Props> = ({ tournamentSeason, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TournamentDto>();
  const values = Form.useWatch([], form);
  const [start, end] = (tournamentSeason.season || "").split("-").map(Number);

  const initialvalues: TournamentDto = {
    tournament: tournamentSeason.tournament,
    start: start > 0 ? start : Years.GLOBAL_START,
    end: end > 0 ? end : Years.GLOBAL_START + 1,
    stages: [],
  };

  return (
    <Modal
      open
      className={styles.modal}
      title={
        tournamentSeason.id
          ? `${t(getTournamentTitle(tournamentSeason))} ${
              tournamentSeason.season
            }`
          : t("home.create")
      }
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        <Form form={form} initialValues={initialvalues}>
          <SeasonInput form={form} disabled={!!tournamentSeason.id} />
          <TournamentSelector
            startOfSeason={values?.start}
            disabled={!!tournamentSeason.id}
          />
          <Divider />
          <h4>{t("home.tournament.stages")}</h4>
        </Form>
      </div>
    </Modal>
  );
};

export { Tournament };
