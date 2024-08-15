import { Cell, Column, Table2 } from "@blueprintjs/table";
import {
  DEFAULT_SWISS_LENGTH,
  LeagueStageData,
  Stage,
  TABLE_ROW_HEIGHT,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { FC, useCallback, useContext } from "react";
import classNames from "classnames";

import { UserContext } from "../../../../../../context/userContext";
import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  stage: Stage;
  table: LeagueStageData["table"];
  version: number;
  highlightedClubId: number | undefined;
}

const LeagueTable: FC<Props> = ({
  table,
  stage,
  version,
  highlightedClubId,
}) => {
  const { user } = useContext(UserContext);

  const clubCellRenderer = useCallback(
    (rowIndex: number) => (
      <Cell
        className={classNames({
          [styles.mine]: [UKRAINE, USSR].includes(
            table[rowIndex]?.team?.club.city.country.name
          ),
          [styles[`winners-${stage.tournamentSeason.tournament}`]]:
            rowIndex < 8,
          [styles.promoted]: rowIndex >= 8 && rowIndex < 24,
          [styles[`highlighted-${stage.tournamentSeason.tournament}`]]:
            table[rowIndex]?.team?.club.id === highlightedClubId,
        })}
      >
        <Club club={table[rowIndex]?.team?.club} />
      </Cell>
    ),
    [highlightedClubId, table, stage.tournamentSeason.tournament]
  );

  const scoreCellRenderer = useCallback(
    (rowIndex: number) => (
      <Cell>
        {table[rowIndex]?.score}
        {table[rowIndex]?.results?.some(
          ({ hasDeductedPoints, tech }) => !!hasDeductedPoints || !!tech
        )
          ? "*"
          : ""}
      </Cell>
    ),
    [table]
  );

  return (
    <div className={styles.table}>
      <Table2
        numRows={stage.stageScheme.swissNum || DEFAULT_SWISS_LENGTH}
        columnWidths={[150, 40]}
        rowHeights={new Array(
          stage.stageScheme.swissNum || DEFAULT_SWISS_LENGTH
        ).fill(TABLE_ROW_HEIGHT)}
        cellRendererDependencies={[version, user?.isEditor, highlightedClubId]}
      >
        <Column key="t" name="" cellRenderer={clubCellRenderer} />
        <Column key="s" name="О" cellRenderer={scoreCellRenderer} />
      </Table2>
    </div>
  );
};

export { LeagueTable };
