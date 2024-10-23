import { FC } from "react";
import { getTournamentTitle } from "@fbs2.0/utils";
import { TournamentSeason } from "@fbs2.0/types";
import classNames from "classnames";
import { Link, To } from "react-router-dom";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";

interface Props {
  tournamentSeason: TournamentSeason;
  linkTo?: To;
}

const TournamentBadge: FC<Props> = ({
  tournamentSeason: { tournament, season },
  linkTo,
}) => {
  const { t } = useTranslation();
  const title = t(getTournamentTitle({ season, tournament }, { short: true }));
  const fullTitle = t(getTournamentTitle({ season, tournament }));

  return (
    <div className={classNames(styles.badge, styles[tournament])}>
      <Tooltip title={fullTitle}>
        {linkTo ? <Link to={linkTo}>{title}</Link> : title}
      </Tooltip>
    </div>
  );
};

export { TournamentBadge };
