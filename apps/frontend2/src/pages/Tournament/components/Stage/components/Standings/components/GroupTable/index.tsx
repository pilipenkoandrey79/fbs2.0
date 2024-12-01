import {
  Group,
  GroupRow,
  StageSchemeType,
  TournamentPart,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { Table, TableProps, Tooltip } from "antd";
import { FC, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import {
  dateRenderer,
  getTeamsQuantityInGroup,
  isNotEmpty,
} from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Club } from "../../../../../../../../components/Club";
import { HighlightContext } from "../../../../../../../../context/highlightContext";
import { getGroupWinnersQuantity } from "../../../../utils";

import styles from "./styles.module.scss";
import variables from "../../../../../../../../style/variables.module.scss";

interface Props {
  tournamentPart: TournamentPart;
  group: Group | undefined;
  groupKey: string;
}

const GroupTable: FC<Props> = ({ tournamentPart, group, groupKey }) => {
  const { t } = useTranslation();
  const { highlightId } = useContext(HighlightContext);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const isXlScreen = useMediaQuery({
    query: `(min-width: ${variables.screenXl})`,
  });

  const columns: TableProps<GroupRow>["columns"] = [
    {
      key: "no",
      rowScope: "row",
      width: isXlScreen ? 24 : 32,
      className: styles.number,
      render: (_, __, index) => index + 1,
    },
    {
      key: "team",
      dataIndex: "team",
      width: isMdScreen && !isXlScreen ? 130 : 100,
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
              ]]: team.club.id === highlightId,
            })}
          />
        ) : null,
    },
    ...(isLgScreen &&
    tournamentPart.stage.stageScheme.type !== StageSchemeType.LEAGUE
      ? new Array(getTeamsQuantityInGroup(tournamentPart.stage.stageScheme))
          .fill(1)
          .map((_, index) => ({
            key: `chess-${index}`,
            dataIndex: "chessCells",
            width: 32,
            className: styles.chess,
            render: (chessCells: GroupRow["chessCells"]) => {
              const { label, match, date } = { ...chessCells[index] };

              return match === null ? (
                <span className={styles.divider} />
              ) : (
                <Tooltip title={dateRenderer(date || null)}>
                  {label}
                  {((match?.deductedPointsList?.length || 0) > 0 ||
                    !!match?.tech) &&
                    "*"}
                </Tooltip>
              );
            },
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
      width: 48,
      render: (goals) => `${goals[0]}-${goals[1]}`,
      title: t("tournament.stages.tables.columns.goals"),
    },
    {
      key: "score",
      dataIndex: "score",
      width: 32,
      title: t("tournament.stages.tables.columns.score"),
      render: (score: number, record) => {
        const deduction = record.results.reduce<number>(
          (acc, { hasDeductedPoints }) => acc + (hasDeductedPoints || 0),
          0
        );

        const value = `${score}${deduction ? "*" : ""}`;

        return deduction ? (
          <Tooltip
            title={t("tournament.stages.matches.form.deducted", {
              points: deduction,
            })}
          >
            {value}
          </Tooltip>
        ) : (
          value
        );
      },
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
      className={
        styles[
          `group-${tournamentPart.stage.tournamentSeason.tournament.toLowerCase()}-${groupKey}`
        ]
      }
    />
  );
};

export { GroupTable };
