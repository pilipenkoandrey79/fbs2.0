import { Group, GroupRow, Participant, TournamentPart } from "@fbs2.0/types";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableProps } from "antd";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  participants: Participant[];
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
}

const Standings: FC<Props> = ({ visible, tournamentPart }) => {
  const { t } = useTranslation();

  const groupIndexes = Object.keys(tournamentPart.matches).sort();

  const columns: TableProps<GroupRow>["columns"] = [];

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.standings}
    >
      {groupIndexes.map((group, _, groups) => (
        <Fragment key={group}>
          {groups.length > 1 && (
            <h4>{`${t("tournament.stages.matches.subtitle", {
              tour: group,
            })}`}</h4>
          )}
          <Table<GroupRow>
            columns={columns}
            dataSource={
              tournamentPart.matches?.[group as Group]?.table ?? undefined
            }
            rowKey="id"
            size="small"
            pagination={false}
            bordered
          />
        </Fragment>
      ))}
    </div>
  );
};

export { Standings };
