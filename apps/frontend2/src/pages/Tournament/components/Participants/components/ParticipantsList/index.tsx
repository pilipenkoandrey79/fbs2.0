import { Participant, StageType } from "@fbs2.0/types";
import { Table, TableProps, Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { getTournamentTitle } from "@fbs2.0/utils";
import { useParams } from "react-router";

import { Flag } from "../../../../../../components/Flag";
import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  participants: Participant[] | undefined;
  condensed?: boolean;
}

const ParticipantsList: FC<Props> = ({ participants, condensed = true }) => {
  const { season } = useParams();
  const { t } = useTranslation();

  const columns: TableProps<Participant>["columns"] = [
    {
      key: "country",
      title: t("tournament.participants.list.columns.country"),
      dataIndex: "club",
      width: condensed ? 50 : 120,
      ellipsis: true,
      render: (club: Participant["club"]) => (
        <span className={styles.country}>
          <span className={styles.name}>{club.city.country.name}</span>
          <span className={styles.code}>
            <Flag country={club.city.country} />
          </span>
        </span>
      ),
    },
    {
      key: "club",
      title: t("tournament.participants.list.columns.club"),
      dataIndex: "club",
      width: condensed ? 120 : 300,
      render: (club: Participant["club"], { fromStage }: Participant) => (
        <Club club={club} dimmed={!!fromStage} showCountry={false} />
      ),
    },
    {
      key: "start",
      title: t("tournament.participants.list.columns.start"),
      dataIndex: "startingStage",
      width: condensed ? 70 : 120,
      render: (startingStage: string, { fromStage }: Participant) => {
        const text = t(
          `tournament.stage.${startingStage}${
            startingStage === StageType.GROUP ||
            startingStage === StageType.GROUP_2
              ? ".short"
              : ""
          }`
        );

        return (
          <Typography.Text
            type={fromStage ? "secondary" : undefined}
            ellipsis={{ tooltip: text }}
          >
            {text}
          </Typography.Text>
        );
      },
    },
    {
      key: "from",
      title: t("tournament.participants.list.columns.from"),
      dataIndex: "fromStage",
      width: condensed ? 90 : 150,
      render: (fromStage: Participant["fromStage"]) => {
        if (!fromStage) {
          return null;
        }

        const text =
          t(
            getTournamentTitle(
              {
                season,
                tournament: fromStage.tournamentSeason.tournament,
              },
              { short: true }
            )
          ) +
          ": " +
          t(
            `tournament.stage.${fromStage?.stageType}${
              fromStage?.stageType === StageType.GROUP ||
              fromStage?.stageType === StageType.GROUP_2
                ? ".short"
                : ""
            }`
          );

        return (
          <Typography.Text type="secondary" ellipsis={{ tooltip: text }}>
            {text}
          </Typography.Text>
        );
      },
    },
    { key: "actions" },
  ];

  return (
    <Table<Participant>
      columns={columns}
      dataSource={participants}
      rowKey="id"
      size="small"
      pagination={false}
    />
  );
};

export { ParticipantsList };
