import {
  Group,
  Participant,
  StageInternal,
  TournamentStage,
} from "@fbs2.0/types";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";

import { ParticipantCell } from "./component/ParticipantCell";
import { ResultsCell } from "./component/ResultsCell";

import styles from "./styles.module.scss";
import variables from "../../../../../../../../style/variables.module.scss";

interface Props {
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[] | undefined;
  };
  matches: TournamentStage;
  stage: StageInternal;
  tour: number | undefined;
  group: Group | undefined;
}

const KnockoutStageTable2: FC<Props> = ({ matches, group, tour, stage }) => {
  const rows = matches?.[group as Group]?.tours?.[tour || 1];

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  return (
    <table className={styles.table}>
      <colgroup>
        {rows.length > 5 && <col style={{ width: 20 }} />}
        <col style={{ width: isLgScreen ? 150 : 100 }} />
        <col style={{ width: 100 }} />
        <col style={{ width: isLgScreen ? 150 : 100 }} />
      </colgroup>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id}>
            {rows.length > 5 && <td>{index + 1}</td>}
            <ParticipantCell team={row.host} stage={stage} />
            <ResultsCell
              results={row.results}
              forceWinnerId={row.forceWinnerId}
              host={row.host}
              guest={row.guest}
            />
            <ParticipantCell team={row.guest} stage={stage} />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { KnockoutStageTable2 };
