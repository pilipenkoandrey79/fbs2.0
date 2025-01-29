import { FC, useContext } from "react";
import { StageInternal, StageTableRow } from "@fbs2.0/types";

import { TeamCell } from "./components/TeamCell";
import { ResultCell } from "./components/ResultCell";
import { DeleteCell } from "./components/DeleteCell";
import { UserContext } from "../../../../../../../../../../context/userContext";
import { useGetTournamentPartMatches } from "../../../../../../../../../../react-query-hooks/match/useGetTournamentPartMatches";

import styles from "./styles.module.scss";

interface Props {
  rows: StageTableRow[];
  stage: StageInternal;
}

const TableView: FC<Props> = ({ rows, stage }) => {
  const { user } = useContext(UserContext);

  const { data: nexStageMatches } = useGetTournamentPartMatches(
    stage.tournamentSeason.season,
    stage.tournamentSeason.tournament,
    stage.nextStage,
  );

  const nextStageHasMatches = Object.keys(nexStageMatches ?? {}).length > 0;

  return (
    <table className={styles.table}>
      <tbody>
        {rows.map((match, index, array) => (
          <tr key={match.id}>
            {array.length > 5 && <td className={styles.number}>{index + 1}</td>}
            <TeamCell team={match.host} stage={stage} />
            <ResultCell match={match} />
            <TeamCell team={match.guest} stage={stage} />
            {user?.isEditor && !nextStageHasMatches && (
              <td>
                <DeleteCell record={match} stageType={stage.stageType} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { TableView };
