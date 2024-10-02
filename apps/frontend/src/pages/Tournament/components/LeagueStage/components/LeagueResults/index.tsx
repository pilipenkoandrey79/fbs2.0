import { _LeagueStageData, Stage } from "@fbs2.0/types";
import { FC } from "react";

import { StageProps } from "../../../../types";
import { KnockoutStage } from "../../../KnockoutStage";

import styles from "./styles.module.scss";

interface Props extends StageProps {
  stage: Stage;
  matches: _LeagueStageData["tours"];
}

const LeagueResults: FC<Props> = ({ matches, ...props }) => (
  <div className={styles.matches}>
    {Object.keys(matches).map((tour) => (
      <div className={styles.matchday}>
        <KnockoutStage
          key={tour}
          {...props}
          matches={matches[Number(tour)]}
          matchDay={Number(tour)}
        />
      </div>
    ))}
  </div>
);

export { LeagueResults };
