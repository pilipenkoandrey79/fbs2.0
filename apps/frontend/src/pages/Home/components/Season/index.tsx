import {
  AvailableTournaments,
  FIRST_ICFC_SEASONS,
  TournamentSeason,
} from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

import { TournamentList } from "../TournamentList";

import styles from "./styles.module.scss";

const getAdditionalClass = (season: string) => {
  const start = Number((season || "").split("-")[0]);

  return start < 1960
    ? FIRST_ICFC_SEASONS.includes(season)
      ? undefined
      : styles["season-50"]
    : start < 1970
    ? styles["season-60"]
    : start < 1980
    ? styles["season-70"]
    : start < 1991
    ? styles["season-80"]
    : start < 2000
    ? styles["season-90"]
    : start < 2010
    ? styles["season-00"]
    : start < 2020
    ? styles["season-10"]
    : start < 2030
    ? styles["season-20"]
    : undefined;
};

interface Props {
  season: string;
  availableTournaments: AvailableTournaments;

  setTournament: (data: TournamentSeason | null) => void;
  setIsDialogOpen: (is: boolean) => void;
}

const Season: FC<Props> = ({
  season,
  availableTournaments,
  setIsDialogOpen,
  setTournament,
}) => (
  <div
    key={season}
    className={classNames(styles.season, getAdditionalClass(season))}
  >
    <div className={styles.list}>
      <h2>{season}</h2>
      <TournamentList
        tournaments={availableTournaments?.[season]}
        season={season}
        setTournament={setTournament}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
    <div className={styles.coefficient}>
      <Link to={`/coefficient/${season}`}>Коеффіціент</Link>
    </div>
  </div>
);

export { Season };
