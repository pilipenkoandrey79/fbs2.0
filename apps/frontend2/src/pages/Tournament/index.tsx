import { FC, useEffect, useState } from "react";
import { useParams } from "react-router";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { getTournamentTitle, isNotEmpty } from "@fbs2.0/utils";
import {
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  Tournament as TournamentType,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { Page } from "../../components/Page";
import { Header } from "./components/Header";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";
import { useGetParticipants } from "../../react-query-hooks/participant/useGetParticipants";
import { Participants } from "./components/Participants";

const Tournament: FC = () => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const matches = useGetMatches(season, tournament);
  const participants = useGetParticipants(season, tournament);

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const [highlightedClubId, setHighlightedClubId] = useState<number | null>(
    () => {
      const initValue = Number(
        searchParams.get(HIGHLIGHTED_CLUB_ID_SEARCH_PARAM)
      );

      return Number.isNaN(initValue) || initValue === 0 ? null : initValue;
    }
  );

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as TournamentType,
    })
  )} ${season}`;

  useEffect(() => {
    const currentSearchParam = searchParams.get(
      HIGHLIGHTED_CLUB_ID_SEARCH_PARAM
    );

    if (highlightedClubId === null && currentSearchParam === null) {
      return;
    }

    if (`${highlightedClubId}` !== currentSearchParam) {
      setSearchParams(
        highlightedClubId
          ? createSearchParams([
              [HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${highlightedClubId}`],
            ])
          : {}
      );
    }
  }, [highlightedClubId, participants, searchParams, setSearchParams]);

  return (
    <Page
      isLoading={matches.isLoading}
      errors={[
        matches.isError ? matches.error : null,
        participants.isError ? participants.error : null,
      ]}
      title={title}
    >
      <Header
        title={title}
        season={season}
        tournament={tournament}
        onParticipants={() => setParticipantsDialogOpened(true)}
        highlightedClubId={highlightedClubId}
        setHighlightedClubId={setHighlightedClubId}
      />

      <Participants
        onClose={() => setParticipantsDialogOpened(false)}
        open={participantsDialogOpened}
      />
    </Page>
  );
};

export { Tournament };
