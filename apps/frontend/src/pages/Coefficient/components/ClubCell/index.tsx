import { Club as ClubType, Winner } from "@fbs2.0/types";
import { FC } from "react";
import { Tooltip } from "@blueprintjs/core";
import { _getTournamentTitle } from "@fbs2.0/utils";

import { Club } from "../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  club: ClubType;
  winners: Winner[] | undefined;
}

const ClubCell: FC<Props> = ({ club, winners }) => {
  const wonTournament = winners?.find(
    ({ winner }) => winner?.club.id === club.id
  )?.tournament;

  return wonTournament ? (
    <Tooltip
      content={`Переможець ${_getTournamentTitle(
        wonTournament?.season,
        wonTournament?.tournament
      )}`}
    >
      <Club club={club} showCountry={false} className={styles.winner} />
    </Tooltip>
  ) : (
    <Club club={club} showCountry={false} />
  );
};

export { ClubCell };
