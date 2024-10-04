import { StageTableRow, TournamentDataRow, UKRAINE, USSR } from "@fbs2.0/types";
import { Table, TableProps } from "antd";
import { FC } from "react";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Club } from "../../../../../../components/Club";
import { ResultsCell } from "./components/ResultsCell";

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
        <ResultsCell
          results={results}
          forceWinnerId={forceWinnerId}
          host={host}
          guest={guest}
        />
      ),
    },
    getTeamColumn("guest"),
  ];

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.matches}
    >
      <h3>{`${t("tournament.stages.results.title")}`}</h3>
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
