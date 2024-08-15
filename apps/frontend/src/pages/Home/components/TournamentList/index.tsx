import {
  AvailableTournament,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  Tournament,
  TournamentSeason,
} from "@fbs2.0/types";
import { FC, useContext } from "react";
import { Button, Intent, Tooltip } from "@blueprintjs/core";
import { Link } from "react-router-dom";

import { UserContext } from "../../../../context/userContext";
import { TournamentBadge } from "../../../../components/TournamentBadge";
import { Club } from "../../../../components/Club";
import { useDeleteTournament } from "../../../../react-query-hooks/tournament/useDeleteTournament";

import styles from "./styles.module.scss";

interface Props {
  tournaments: AvailableTournament[];
  season: string;
  setTournament: (data: TournamentSeason | null) => void;
  setIsDialogOpen: (is: boolean) => void;
}

const TournamentList: FC<Props> = ({
  tournaments,
  season,
  setTournament,
  setIsDialogOpen,
}) => {
  const { user } = useContext(UserContext);

  const { mutate: deleteTournament } = useDeleteTournament();

  return (
    <ul className={styles.list}>
      {Object.values(Tournament).map((tournamenType) => {
        const tournament = tournaments.find(
          ({ type }) => tournamenType === type
        );

        if (!tournament) {
          return undefined;
        }

        const { id, hasMatches, type, winner, finalist } = tournament;

        return (
          <li key={id}>
            <div className={styles.tournament}>
              <div className={styles.badges}>
                {user?.isEditor && (
                  <Button
                    icon="eye-open"
                    small
                    minimal
                    onClick={() => {
                      setTournament({ id, tournament: type, season });
                      setIsDialogOpen(true);
                    }}
                  />
                )}
                {!hasMatches && (
                  <Button
                    intent={Intent.DANGER}
                    onClick={() => deleteTournament(id)}
                    icon="trash"
                    small
                    minimal
                  />
                )}
                <TournamentBadge
                  tournamentSeason={
                    { tournament: type, season } as TournamentSeason
                  }
                  linkTo={`/tournaments/${season}/${type}`}
                />
              </div>
              {winner && (
                <Link
                  to={`/tournaments/${season}/${type}?${HIGHLIGHTED_CLUB_ID_SEARCH_PARAM}=${winner?.club?.id}`}
                  className={styles.winner}
                >
                  <Tooltip
                    content={
                      finalist ? (
                        <>
                          <span>Фіналіст: </span>
                          <Club club={finalist?.club} />
                        </>
                      ) : undefined
                    }
                  >
                    <Club club={winner?.club} />
                  </Tooltip>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export { TournamentList };
