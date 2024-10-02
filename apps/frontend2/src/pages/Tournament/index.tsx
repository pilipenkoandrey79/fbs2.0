import { FC, useEffect, useMemo, useState } from "react";
import { generatePath, useParams } from "react-router";
import { createSearchParams, Link, useSearchParams } from "react-router-dom";
import { getStageTransKey, getTournamentTitle } from "@fbs2.0/utils";
import {
  AvailableTournaments,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  Tournament as TournamentType,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { OrderedListOutlined } from "@ant-design/icons";
import { Collapse, Menu } from "antd";

import { Page } from "../../components/Page";
import { Stage } from "./components/Stage";
import { Participants } from "./components/Participants";
import { Header } from "./components/Header";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";
import { useGetParticipants } from "../../react-query-hooks/participant/useGetParticipants";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { Paths } from "../../routes";

const Tournament: FC = () => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const matches = useGetMatches(season, tournament);
  const participants = useGetParticipants(season, tournament);
  const { data: availableTournaments } = useGetTournamentSeasons(true);

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

  const navLinks = useMemo(() => {
    const tournaments = (availableTournaments as AvailableTournaments)?.[
      season || ""
    ]
      ?.filter((availableTournament) => tournament !== availableTournament.type)
      ?.map(({ type }) => ({
        key: type,
        label: (
          <Link
            to={generatePath(Paths.TOURNAMENT, {
              tournament: type,
              season: season || "",
            })}
          >
            {t(
              getTournamentTitle({ season, tournament: type }, { short: true })
            )}
          </Link>
        ),
      }));

    return [
      {
        key: "coeff",
        label: (
          <Link to={generatePath(Paths.COEFFICIENT, { season: season || "" })}>
            <OrderedListOutlined />
          </Link>
        ),
      },
      ...(tournaments || []),
    ];
  }, [availableTournaments, season, t, tournament]);

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
      menu={<Menu items={navLinks} mode="horizontal" theme="dark" />}
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
      <Collapse
        bordered={false}
        items={matches.data?.map((tournamentPart) => ({
          key: tournamentPart.stage.id,
          children: <Stage tournamentPart={tournamentPart} />,
          label: t(getStageTransKey(tournamentPart.stage.stageType)),
        }))}
      />
    </Page>
  );
};

export { Tournament };
