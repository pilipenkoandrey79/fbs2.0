import { StageTableRow, TournamentDataRow, UKRAINE, USSR } from "@fbs2.0/types";
import { Table, TableProps, Tooltip, Typography } from "antd";
import { FC } from "react";
import classNames from "classnames";
import { isNotEmpty, dateRenderer } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  tournamentPart: TournamentDataRow;
  highlightedClubId: number | null;
}

const Results: FC<Props> = ({ visible, tournamentPart, highlightedClubId }) => {
  const { t } = useTranslation();

  const getTeamColumn = (key: "host" | "guest") => ({
    key,
    dataIndex: key,
    width: 120,
    ellipsis: true,
    render: (team: StageTableRow["host"] | StageTableRow["guest"]) => (
      <Club
        club={team.club}
        showCity={false}
        className={classNames(styles.club, {
          [styles.winner]: team.isWinner,
          [styles.mine]: [UKRAINE, USSR].includes(team.club.city.country.name),
          [styles.relegated]:
            isNotEmpty(tournamentPart.stage.linkedTournament) && !team.isWinner,
          [styles[
            `highlighted-${tournamentPart.stage.tournamentSeason.tournament}`
          ]]: team.club.id === highlightedClubId,
        })}
      />
    ),
  });

  const columns: TableProps<StageTableRow>["columns"] = [
    getTeamColumn("host"),
    {
      key: "results",
      dataIndex: "results",
      width: 100,
      className: styles["results-cell"],
      render: (
        results: StageTableRow["results"],
        { forceWinnerId, host, guest }
      ) => (
        <div className={styles.results}>
          {results.map(
            ({
              date,
              hostScore,
              guestScore,
              replayDate,
              hostPen,
              guestPen,
            }) => (
              <div
                key={date}
                className={classNames(styles.match, {
                  [styles["only-match"]]: !replayDate,
                })}
              >
                <div className={styles.result}>
                  <Typography.Text className={styles.date} type="secondary">
                    {dateRenderer(date)}
                  </Typography.Text>
                  <span className={styles.score}>{`${hostScore}:${guestScore} ${
                    !replayDate && isNotEmpty(hostPen) && isNotEmpty(guestPen)
                      ? t("tournament.stages.results.pen", {
                          h: hostPen,
                          g: guestPen,
                        })
                      : ""
                  }`}</span>
                </div>
                {replayDate && (
                  <div
                    className={classNames(styles.result, {
                      [styles.coin]: forceWinnerId,
                    })}
                  >
                    <Typography.Text className={styles.date} type="secondary">
                      {replayDate}
                    </Typography.Text>
                    <span className={styles.score}>
                      {forceWinnerId ? (
                        <Tooltip
                          title={t("tournament.stages.results.coin", {
                            club: [host, guest].find(
                              ({ id }) => id === forceWinnerId
                            )?.club.name,
                          })}
                        >{`${hostPen}:${guestPen}`}</Tooltip>
                      ) : (
                        `${hostPen}:${guestPen}`
                      )}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      ),
    },
    getTeamColumn("guest"),
  ];

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.matches}
    >
      <Table<StageTableRow>
        columns={columns}
        dataSource={tournamentPart.matches as StageTableRow[]}
        rowKey="id"
        size="small"
        pagination={false}
        showHeader={false}
        bordered
      />
    </div>
  );
};

export { Results };
