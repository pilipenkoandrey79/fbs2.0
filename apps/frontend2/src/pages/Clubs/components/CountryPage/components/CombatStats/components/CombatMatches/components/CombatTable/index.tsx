import { FC } from "react";
import { Flex, Table, TableProps, Typography } from "antd";
import { CombatRow, StageType, TournamentSeason } from "@fbs2.0/types";
import { dateRenderer, isNotEmpty } from "@fbs2.0/utils";
import { generatePath } from "react-router";
import { useTranslation } from "react-i18next";

import { CombatComponentProps } from "../..";
import { TournamentBadge } from "../../../../../../../../../../components/TournamentBadge";
import { Paths } from "../../../../../../../../../../routes";
import { Club } from "../../../../../../../../../../components/Club";
import { Score } from "../../../../../../../../../../components/Score";

import styles from "./styles.module.scss";

const CombatTable: FC<CombatComponentProps> = ({ data }) => {
  const { t } = useTranslation();

  const columns: TableProps<CombatRow>["columns"] = [
    {
      key: "tournament-season",
      dataIndex: "tournamentSeason",
      render: (tournamentSeason: TournamentSeason) => (
        <Flex gap="small" vertical>
          <span>{tournamentSeason.season}</span>
          <TournamentBadge
            tournamentSeason={tournamentSeason}
            linkTo={generatePath(Paths.TOURNAMENT, {
              season: tournamentSeason.season,
              tournament: tournamentSeason.tournament,
            })}
          />
        </Flex>
      ),
    },
    {
      key: "matches",
      dataIndex: "stages",
      render: (stages: CombatRow["stages"]) => (
        <table className={styles.matches}>
          <tbody>
            {stages.map((stage) =>
              stage.matches.map((match) => {
                const stageLabel = t(
                  `tournament.stage.${stage.stage.stageType}${
                    stage.stage.stageType === StageType.GROUP ||
                    stage.stage.stageType === StageType.GROUP_2
                      ? ".short"
                      : ""
                  }`,
                );

                return (
                  <tr key={match.id}>
                    <td className={styles.date}>
                      <Typography.Text type="secondary">
                        {dateRenderer(match.date)}
                      </Typography.Text>
                    </td>
                    <td>
                      <Typography.Text ellipsis={{ tooltip: stageLabel }}>
                        {stageLabel}
                      </Typography.Text>
                    </td>
                    <td>
                      <span>
                        <Club
                          club={match.host.club}
                          showCountry={false}
                          showCity={false}
                        />
                        {" - "}
                        <Club
                          club={match.guest.club}
                          showCountry={false}
                          showCity={false}
                        />
                      </span>
                    </td>
                    <td className={styles.score}>
                      <Score match={match} />
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      ),
    },
  ];

  return (
    <Table<CombatRow>
      columns={columns}
      rowKey={({ tournamentSeason }) => tournamentSeason.id}
      dataSource={data?.rows}
      pagination={false}
      bordered
      size="small"
      showHeader={false}
    />
  );
};

export { CombatTable };
