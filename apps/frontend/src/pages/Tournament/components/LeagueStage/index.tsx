import { FC } from "react";
import { LeagueStageData, Stage } from "@fbs2.0/types";

import { StageProps } from "../../types";
import { LeagueTable } from "./components/LeagueTable";
import { LeagueResults } from "./components/LeagueResults";

import styles from "./styles.module.scss";

interface Props extends StageProps {
  stage: Stage;
  matches: LeagueStageData;
}

const LeagueStage: FC<Props> = ({
  version,
  highlightedClubId,
  stage,
  matches,
  participants,
  isRefetching,
}) => (
  <div className={styles.stage}>
    <LeagueTable
      stage={stage}
      table={matches.table}
      version={version}
      highlightedClubId={highlightedClubId}
    />

    <LeagueResults
      highlightedClubId={highlightedClubId}
      matches={matches.tours}
      stage={stage}
      participants={participants}
      version={version}
      isRefetching={isRefetching}
    />
  </div>
);

export { LeagueStage };
