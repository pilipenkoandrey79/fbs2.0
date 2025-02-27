import { FC } from "react";
import { StageInternal, StageTableRow } from "@fbs2.0/types";

import { TeamCell } from "./components/TeamCell";
import { ResultCell } from "./components/ResultCell";

import styles from "./styles.module.scss";

interface Props {
  rows: StageTableRow[];
  stage: StageInternal;
}

const TableView: FC<Props> = ({ rows, stage }) => (
  <table className={styles.table}>
    <tbody>
      {rows.map((match, index, array) => (
        <tr key={`${match.host.id}-${match.guest.id}`}>
          {array.length > 5 && <td className={styles.number}>{index + 1}</td>}
          <TeamCell team={match.host} stage={stage} />
          <ResultCell match={match} />
          <TeamCell team={match.guest} stage={stage} />
        </tr>
      ))}
    </tbody>
  </table>
);

export { TableView };
