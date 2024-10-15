import {
  Group,
  GroupRow,
  StageSchemeType,
  TournamentPart,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { Table, TableProps, Tooltip } from "antd";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import { dateRenderer, isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Club } from "../../../../../../../../components/Club";
import { getGroupWinnersQuantity } from "../../../../utils";

import styles from "./styles.module.scss";
import variables from "../../../../../../../../style/variables.module.scss";

interface Props {
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
  group: Group | undefined;
  groupKey: string;
  loading?: boolean;
}

const GroupTable: FC<Props> = ({
  tournamentPart,
  highlightedClubId,
  group,
  loading,
  groupKey,
}) => {
  const { t } = useTranslation();

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const columns: TableProps<GroupRow>["columns"] = [
    {
      key: "no",
      rowScope: "row",
      width: 32,
      className: styles.number,
      render: (_, __, index) => index + 1,
    },
    {
      key: "team",
      dataIndex: "team",
      width: isMdScreen ? 150 : 100,
      ellipsis: true,
      className: styles.team,
      render: (team: GroupRow["team"], _, index) =>
        team.club ? (
          <Club
            club={team.club}
            showCity={false}
            className={classNames(styles.club, {
              ...(tournamentPart.stage.stageScheme.type !==
              StageSchemeType.LEAGUE
                ? {
                    [styles.winner]:
                      index <
                      getGroupWinnersQuantity(
                        tournamentPart.stage.stageScheme.type
                      ),
                    [styles.relegated]:
                      isNotEmpty(tournamentPart.stage.linkedTournament) &&
                      index === 2,
                  }
                : {}),
              [styles.mine]: [UKRAINE, USSR].includes(
                team.club.city.country.name
              ),
              [styles[
                `highlighted-${tournamentPart.stage.tournamentSeason.tournament}`
              ]]: team.club.id === highlightedClubId,
            })}
          />
        ) : null,
    },
    ...(isMdScreen &&
    tournamentPart.stage.stageScheme.type !== StageSchemeType.LEAGUE
      ? new Array(4).fill(1).map((_, index) => ({
          key: `chess-${index}`,
          dataIndex: "chessCells",
          width: 32,
          className: styles.chess,
          render: (chessCells: GroupRow["chessCells"]) =>
            chessCells[index]?.label ? (
              <Tooltip title={dateRenderer(chessCells[index]?.date || null)}>
                {chessCells[index].label}
              </Tooltip>
            ) : (
              <span className={styles.divider} />
            ),
        }))
      : []),
    {
      key: "games",
      dataIndex: "games",
      width: 20,
      title: t("tournament.stages.tables.columns.games"),
    },
    {
      key: "win",
      dataIndex: "win",
      width: 20,
      title: t("tournament.stages.tables.columns.win"),
    },
    {
      key: "draw",
      dataIndex: "draw",
      width: 20,
      title: t("tournament.stages.tables.columns.draw"),
    },
    {
      key: "defeat",
      dataIndex: "defeat",
      width: 20,
      title: t("tournament.stages.tables.columns.defeat"),
    },
    {
      key: "goals",
      dataIndex: "goals",
      width: 60,
      render: (goals) => `${goals[0]}-${goals[1]}`,
      title: t("tournament.stages.tables.columns.goals"),
    },
    {
      key: "score",
      dataIndex: "score",
      width: 32,
      title: t("tournament.stages.tables.columns.score"),
    },
  ];

  const getRowClassName = (_: GroupRow, index: number) => {
    if (tournamentPart.stage.stageScheme.type !== StageSchemeType.LEAGUE) {
      return "";
    }

    const winnerQuantity = getGroupWinnersQuantity(
      tournamentPart.stage.stageScheme.type
    );

    if (index < winnerQuantity * 3) {
      if (index < winnerQuantity * 2) {
        if (index < winnerQuantity) {
          return styles["league-winner"];
        } else {
          return styles["league-playoff-seeded"];
        }
      } else {
        return styles["league-playoff-unseeded"];
      }
    } else {
      return styles["league-relegated"];
    }
  };

  return (
    <Table<GroupRow>
      columns={columns}
      dataSource={tournamentPart.matches?.[group as Group]?.table ?? undefined}
      rowKey="id"
      size="small"
      pagination={false}
      bordered
      rowHoverable={false}
      rowClassName={getRowClassName}
      loading={loading}
      className={
        styles[
          `group-${tournamentPart.stage.tournamentSeason.tournament.toLowerCase()}-${groupKey}`
        ]
      }
    />
  );
};

export { GroupTable };
