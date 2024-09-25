import { useContext, useEffect, useMemo, useState } from "react";
import {
  createSearchParams,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  AvailableTournaments,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  Tournament as TournamentType,
} from "@fbs2.0/types";
import {
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  HotkeysProvider,
  Icon,
} from "@blueprintjs/core";
import {
  _getTournamentTitle,
  isNotEmpty,
  transformTournamentPart,
} from "@fbs2.0/utils";
import classNames from "classnames";

import { HeaderNavLink, Page } from "../../components/Page";
import { AddClubForm } from "./components/Participants/components/AddClubForm";
import { LoadOrError } from "../../components/LoadOrError";
import { useGetParticipants } from "../../react-query-hooks/participants/useGetParticipants";
import { Participants } from "./components/Participants";
import { useGetCountries } from "../../react-query-hooks/country/useGetCountries";
import { UserContext } from "../../context/userContext";
import { useGetClubs } from "../../react-query-hooks/club/useGetClubs";
import { Stage } from "./components/Stage";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { ParticipantSelector } from "../../components/selectors/ParticipantSelector";
import { useGetMatches } from "../../react-query-hooks/matches/useGetMatches";

import styles from "./styles.module.scss";

const Tournament = () => {
  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(UserContext);
  const { data: availableTournaments } = useGetTournamentSeasons();
  const { data: countries = [] } = useGetCountries(season?.split("-")?.[0]);
  const { data: clubs = [] } = useGetClubs(season?.split("-")?.[0]);

  const { data: participants = [], dataUpdatedAt: participantsVersion } =
    useGetParticipants(season, tournament as TournamentType);

  const { data, error, isLoading, isRefetching, dataUpdatedAt, invalidate } =
    useGetMatches(season, tournament as TournamentType);

  const tournamentMatches = useMemo(() => {
    const matchesByStages = data?.map(transformTournamentPart);

    return {
      matchesByStages,
      stages: matchesByStages?.map(({ stage }) => stage),
    };
  }, [data]);

  const { previousLink, nextLink } = useMemo(() => {
    const [start, finish] = (season || "").split("-").map((v) => Number(v));
    const prevSeason = `${start - 1}-${finish - 1}`;
    const nextSeason = `${start + 1}-${finish + 1}`;

    const prevSeasonTournament = availableTournaments?.[prevSeason]?.find(
      ({ type }) => type === tournament
    );

    const nextSeasonTournament = availableTournaments?.[nextSeason]?.find(
      ({ type }) => type === tournament
    );

    const previousLink = prevSeasonTournament
      ? `/tournaments/${prevSeason}/${prevSeasonTournament.type}`
      : undefined;

    const nextLink = nextSeasonTournament
      ? `/tournaments/${nextSeason}/${nextSeasonTournament.type}`
      : undefined;

    return { previousLink, nextLink };
  }, [availableTournaments, season, tournament]);

  const navLinks = useMemo((): HeaderNavLink[] | undefined => {
    if (!season) {
      return undefined;
    }

    const tournaments = (availableTournaments as AvailableTournaments)?.[season]
      ?.filter((availableTournament) => tournament !== availableTournament.type)
      ?.map<HeaderNavLink>(({ type }) => ({
        to: `/tournaments/${season}/${type}`,
        label: _getTournamentTitle(season, type, true, true),
      }));

    return [
      {
        to: `/coefficient/${season}`,
        label: "Коеффіцієнт",
        icon: "numbered-list",
      },
      ...(tournaments || []),
    ];
  }, [availableTournaments, season, tournament]);

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const [highlightedClubId, setHighlightedClubId] = useState<
    number | undefined
  >(() => {
    const initValue = Number(
      searchParams.get(HIGHLIGHTED_CLUB_ID_SEARCH_PARAM)
    );

    return Number.isNaN(initValue) || initValue === 0 ? undefined : initValue;
  });

  const toggleParticipantDialog = () => {
    if (participantsDialogOpened) {
      invalidate();
    }

    setParticipantsDialogOpened(!participantsDialogOpened);
  };

  useEffect(() => {
    const currentSearchParam = searchParams.get(
      HIGHLIGHTED_CLUB_ID_SEARCH_PARAM
    );

    if (`${highlightedClubId}` !== currentSearchParam) {
      if (isNotEmpty(highlightedClubId)) {
        setSearchParams(
          createSearchParams([
            [HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${highlightedClubId}`],
          ])
        );
      } else {
        setSearchParams({});
      }
    }
  }, [highlightedClubId, participants, searchParams, setSearchParams]);

  return (
    <Page navLinks={navLinks}>
      <HotkeysProvider>
        <div
          className={classNames(
            styles.tournament,
            tournament ? styles[tournament] : undefined
          )}
        >
          <div className={styles["tournament-header"]}>
            <div className={styles["tournament-header-title"]}>
              {previousLink && (
                <a
                  href={previousLink}
                  className={classNames(
                    Classes.TEXT_LARGE,
                    styles["tournament-header-title-link"]
                  )}
                >
                  <Icon icon="arrow-left" />
                  Попередній сезон
                </a>
              )}
              <h1>
                {_getTournamentTitle(season, tournament as TournamentType)}
              </h1>
              {nextLink && (
                <a
                  href={nextLink}
                  className={classNames(
                    Classes.TEXT_LARGE,
                    styles["tournament-header-title-link"]
                  )}
                >
                  Наступний сезон
                  <Icon icon="arrow-right" />
                </a>
              )}
            </div>
            <div className={styles.highlighting}>
              <span>Підсвітити учасника: </span>
              <ParticipantSelector
                participants={participants}
                selectedItemId={
                  participants.find(({ club }) => club.id === highlightedClubId)
                    ?.id
                }
                onSelect={(participantId) =>
                  setHighlightedClubId(
                    participants.find(({ id }) => participantId === id)?.club.id
                  )
                }
              />
              <Button
                icon="cross"
                onClick={() => setHighlightedClubId(undefined)}
                disabled={!highlightedClubId}
              />
            </div>
            <Button text="Учасники" onClick={toggleParticipantDialog} />
          </div>
          <LoadOrError loading={isLoading} error={error} errorRedirect="/">
            <div className={styles.stages}>
              {tournamentMatches.matchesByStages?.map((stage, index) => (
                <Stage
                  matchesBystages={tournamentMatches.matchesByStages}
                  index={index}
                  key={stage.stage.stageType}
                  participants={participants}
                  version={dataUpdatedAt}
                  isRefetching={isRefetching}
                  highlightedClubId={highlightedClubId}
                />
              ))}
            </div>
          </LoadOrError>
          {participantsDialogOpened && (
            <Dialog
              title="Учасники"
              canEscapeKeyClose={false}
              canOutsideClickClose={false}
              isOpen
              onClose={toggleParticipantDialog}
              className={styles["participants-dialog"]}
            >
              <DialogBody className={styles["participants-dialog-body"]}>
                <Participants
                  participants={participants}
                  version={participantsVersion}
                  countries={countries}
                  clubs={clubs}
                  stages={tournamentMatches.stages ?? []}
                  season={season}
                  tournament={tournament as TournamentType}
                  hasLinkedTournament={
                    season
                      ? (availableTournaments as AvailableTournaments)?.[
                          season
                        ]?.find(
                          (availableTournament) =>
                            tournament === availableTournament.type
                        )?.hasLinkedTournaments || false
                      : false
                  }
                />
              </DialogBody>
              <DialogFooter>
                {user?.isEditor && <AddClubForm countries={countries} />}
              </DialogFooter>
            </Dialog>
          )}
        </div>
      </HotkeysProvider>
    </Page>
  );
};

export { Tournament };
