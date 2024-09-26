import { Participant } from "@fbs2.0/types";
import { Table, TableProps } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import { Flag } from "../../../../../../components/Flag";
import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";
import variables from "../../../../../../style/variables.module.scss";

interface Props {
  participants: Participant[] | undefined;
}

const ParticipantsList: FC<Props> = ({ participants }) => {
  const { t } = useTranslation();

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const columns: TableProps<Participant>["columns"] = [
    {
      key: "country",
      title: t("tournament.participants.list.columns.country"),
      dataIndex: "club",
      width: isMdScreen ? 120 : 50,
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
      width: isMdScreen ? 300 : 120,
      render: (club: Participant["club"], { fromStage }: Participant) => (
        <Club club={club} dimmed={!!fromStage} showCountry={false} />
      ),
    },
    { key: "start", title: t("tournament.participants.list.columns.start") },
    { key: "from", title: t("tournament.participants.list.columns.from") },
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
