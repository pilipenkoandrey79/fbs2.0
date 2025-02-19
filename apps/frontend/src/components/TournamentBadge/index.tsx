import { TournamentSeason } from "@fbs2.0/types";
import { FC } from "react";
import { _getTournamentTitle } from "@fbs2.0/utils";
import classNames from "classnames";
import { Classes, Tooltip } from "@blueprintjs/core";
import { Link, To } from "react-router";

import styles from "./styles.module.scss";

interface Props {
  tournamentSeason: TournamentSeason;
  linkTo?: To;
}

const TournamentBadge: FC<Props> = ({
  tournamentSeason: { tournament, season },
  linkTo,
}) => {
  const title = _getTournamentTitle(season, tournament, false, true);
  const fullTitle = _getTournamentTitle(season, tournament, true, false);

  return (
    <div
      className={classNames(
        styles.badge,
        Classes.TEXT_SMALL,
        styles[tournament]
      )}
    >
      <Tooltip content={fullTitle}>
        {linkTo ? <Link to={linkTo}>{title}</Link> : title}
      </Tooltip>
    </div>
  );
};

export { TournamentBadge };
