import { FC, useContext, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { getTournamentTitle } from "@fbs2.0/utils";
import { Tournament as TournamentType } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { Page } from "../../components/Page";
import { Header } from "./components/Header";
import { UserContext } from "../../context/userContext";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";
import { useGetParticipants } from "../../react-query-hooks/participant/useGetParticipants";
import { Participants } from "./components/Participants";

const Tournament: FC = () => {
  const { t } = useTranslation();

  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(UserContext);

  const matches = useGetMatches(season, tournament);
  const participants = useGetParticipants(season, tournament);

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as TournamentType,
    })
  )} ${season}`;

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
      />
      {participantsDialogOpened && (
        <Participants onClose={() => setParticipantsDialogOpened(false)} />
      )}
    </Page>
  );
};

export { Tournament };
