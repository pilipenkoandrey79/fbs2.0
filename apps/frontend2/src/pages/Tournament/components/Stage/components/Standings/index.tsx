import {
  Group,
  GroupRow,
  Participant,
  TournamentPart,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableProps } from "antd";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";

import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  participants: Participant[];
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
}

const Standings: FC<Props> = ({
  visible,
  tournamentPart,
  highlightedClubId,
}) => {
  const { t } = useTranslation();

  const groupIndexes = Object.keys(tournamentPart.matches).sort();

  const columns: TableProps<GroupRow>["columns"] = [
    {
      key: "no",
      rowScope: "row",
      width: 20,
      className: styles.number,
      render: (_, __, index) => index + 1,
    },
    {
      key: "team",
      dataIndex: "team",
      width: 150,
      ellipsis: true,
      render: (team: GroupRow["team"]) =>
        team.club ? (
          <Club
            club={team.club}
            showCity={false}
            className={classNames(styles.club, {
              [styles.mine]: [UKRAINE, USSR].includes(
                team.club.city.country.name
              ),
              [styles.relegated]: isNotEmpty(
                tournamentPart.stage.linkedTournament
              ),
              [styles[
                `highlighted-${tournamentPart.stage.tournamentSeason.tournament}`
              ]]: team.club.id === highlightedClubId,
            })}
          />
        ) : null,
    },
  ];

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.standings}
    >
      {groupIndexes.map((group, _, groups) => (
        <Fragment key={group}>
          {groups.length > 1 && (
            <h4>{`${t("tournament.stages.matches.group_subtitle", {
              group,
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
