import { useContext, useState } from "react";
import { TournamentSeason } from "@fbs2.0/types";
import { Button, Intent } from "@blueprintjs/core";

import { Page } from "../../components/Page";
import { Season } from "./components/Season";
import { WinnersList } from "./components/WinnersList";
import { TournamentDialog } from "./components/TournamentDialog";
import { LoadOrError } from "../../components/LoadOrError";
import { UserContext } from "../../context/userContext";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";

import styles from "./styles.module.scss";

const Home = () => {
  const { user } = useContext(UserContext);

  const {
    data: availableTournaments,
    isLoading,
    error,
  } = useGetTournamentSeasons();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tournament, setTournament] = useState<TournamentSeason | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedSeasons = [...Object.keys(availableTournaments || {})].sort(
    (a, b) => {
      const aStart = Number((a || "").split("-")[0]);
      const bStart = Number((b || "").split("-")[0]);

      return sortAsc ? aStart - bStart : bStart - aStart;
    }
  );

  const onClose = () => {
    setTournament(null);
    setIsDialogOpen(false);
  };

  return (
    <Page>
      <div className={styles.top}>
        <h1>
          Турніри
          <Button
            icon={sortAsc ? "sort-asc" : "sort-desc"}
            onClick={() => setSortAsc(!sortAsc)}
            small
            minimal
          />
        </h1>
        {user?.isEditor && (
          <div className={styles.controls}>
            {availableTournaments && (
              <WinnersList
                seasons={sortedSeasons}
                availableTournaments={availableTournaments}
              />
            )}
            <Button
              text="Створити турнір"
              intent={Intent.PRIMARY}
              onClick={() => setIsDialogOpen(true)}
            />
          </div>
        )}
      </div>
      <div className={styles.container}>
        <LoadOrError loading={isLoading} error={error}>
          {availableTournaments &&
            sortedSeasons.map((season) => (
              <Season
                key={season}
                season={season}
                availableTournaments={availableTournaments}
                setIsDialogOpen={setIsDialogOpen}
                setTournament={setTournament}
              />
            ))}
        </LoadOrError>
      </div>
      {isDialogOpen && (
        <TournamentDialog
          isOpen={isDialogOpen}
          onClose={onClose}
          tournament={tournament}
          availableTournaments={availableTournaments}
        />
      )}
    </Page>
  );
};

export { Home };
