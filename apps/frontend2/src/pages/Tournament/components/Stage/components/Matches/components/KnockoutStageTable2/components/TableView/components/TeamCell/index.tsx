import { FC, useContext } from "react";
import { ClubWithWinner, StageInternal, UKRAINE, USSR } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import { Club } from "../../../../../../../../../../../../components/Club";
import { HighlightContext } from "../../../../../../../../../../../../context/highlightContext";

import styles from "./styles.module.scss";
import variables from "../../../../../../../../../../../../style/variables.module.scss";

interface Props {
  team: ClubWithWinner;
  stage: StageInternal;
}

const TeamCell: FC<Props> = ({ team, stage }) => {
  const { highlightId } = useContext(HighlightContext);

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  return (
    <td className={styles.team}>
      <Club
        club={team.club}
        showCity={isLgScreen}
        className={classNames(styles.club, {
          [styles.winner]: team?.isWinner,
          [styles.mine]: [UKRAINE, USSR].includes(team.club?.city.country.name),
          [styles.relegated]:
            isNotEmpty(stage.linkedTournament) && !team?.isWinner,
          [styles[`highlighted-${stage.tournamentSeason.tournament}`]]:
            team.club?.id === highlightId,
        })}
      />
    </td>
  );
};

export { TeamCell };
