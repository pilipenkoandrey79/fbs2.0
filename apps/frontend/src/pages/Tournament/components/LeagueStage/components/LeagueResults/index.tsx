import { LeagueStageData, Stage } from "@fbs2.0/types";
import { FC } from "react";

import { StageProps } from "../../../../types";
import { KnockoutStage } from "../../../KnockoutStage";

import styles from "./styles.module.scss";

interface Props extends StageProps {
  stage: Stage;
  matches: LeagueStageData["tours"];
}

const LeagueResults: FC<Props> = ({ matches, ...props }) => (
  <div className={styles.matches}>
    {Object.keys(matches).map((tour) => (
      <KnockoutStage key={tour} {...props} matches={matches[Number(tour)]} />
    ))}
  </div>
);

export { LeagueResults };
