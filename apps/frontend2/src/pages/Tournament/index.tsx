import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useParams } from "react-router";
import { getTournamentTitle } from "@fbs2.0/utils";
import { Tournament as TournamentType } from "@fbs2.0/types";
import { Spin } from "antd";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { Panel } from "./components/Panel";
import { TournamentLogo } from "../../components/TournamentLogo";
import { HighlightContext } from "../../context/highlightContext";
import { useHighlightContext } from "../../context/useHighlightContext";
import { Page } from "../../components/Page";
import { TournamentMenu } from "./components/TournamentMenu";
import { Participants } from "./components/Participants";

import styles from "./styles.module.scss";

const Tournament: FC = () => {
  const highlightedState = useHighlightContext();
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const fetchings = useIsFetching();
  const mutatings = useIsMutating();

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as TournamentType,
    }),
  )} ${season}`;

  return (
    <HighlightContext.Provider value={highlightedState}>
      <Page
        title={title}
        menu={<TournamentMenu />}
        className={styles[`tournament-${tournament}`]}
      >
        <Spin fullscreen spinning={fetchings > 0 || mutatings > 0} />
        <Participants
          onClose={() => setParticipantsDialogOpened(false)}
          open={participantsDialogOpened}
        />
        <div className={styles.header}>
          <div className={styles.title}>
            <TournamentLogo />
            <h1>{title}</h1>
          </div>
          <Panel
            season={season}
            tournament={tournament}
            onParticipants={() => setParticipantsDialogOpened(true)}
          />
        </div>
        <Outlet />
      </Page>
    </HighlightContext.Provider>
  );
};

export { Tournament };
