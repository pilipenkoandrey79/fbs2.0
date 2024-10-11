import { FC, useEffect, useMemo, useState, useTransition } from "react";
import { useParams } from "react-router";
import { createSearchParams, useSearchParams } from "react-router-dom";
import {
  getStageTransKey,
  getTournamentTitle,
  transformTournamentPart,
  transformTournamentPart_2,
} from "@fbs2.0/utils";
import {
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  TournamentDataRow,
  Tournament as TournamentType,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";

import { Page } from "../../components/Page";
import { Stage } from "./components/Stage";
import { Participants } from "./components/Participants";
import { Header } from "./components/Header";
import { TournamentMenu } from "./components/TournamentMenu";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";
import { useGetParticipants } from "../../react-query-hooks/participant/useGetParticipants";

const Tournament: FC = () => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const rawMatches = useGetMatches(season, tournament);
  const participants = useGetParticipants(season, tournament);

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const [activeKey, setActiveKey] = useState<(number | string)[]>();

  const [highlightedClubId, setHighlightedClubId] = useState<number | null>(
    () => {
      const initValue = Number(
        searchParams.get(HIGHLIGHTED_CLUB_ID_SEARCH_PARAM)
      );

      return Number.isNaN(initValue) || initValue === 0 ? null : initValue;
    }
  );

  const matches = useMemo<TournamentDataRow[] | undefined>(
    () =>
      rawMatches.data?.map((tournamentPart) => ({
        stage: tournamentPart.stage,
        matches: transformTournamentPart(tournamentPart),
      })),
    [rawMatches.data]
  );

  const matches_2 = useMemo(
    () =>
      rawMatches.data?.map((tournamentPart) => ({
        stage: tournamentPart.stage,
        matches: transformTournamentPart_2(tournamentPart),
      })),
    [rawMatches.data]
  );

  console.log(matches_2);

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
      isLoading={rawMatches.isLoading}
      errors={[
        rawMatches.isError ? rawMatches.error : null,
        participants.isError ? participants.error : null,
      ]}
      title={title}
      menu={<TournamentMenu />}
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
        activeKey={activeKey}
        items={matches?.map((tournamentPart) => {
          const previousTournamentPart =
            tournamentPart.stage.previousStage === null
              ? undefined
              : matches.find(
                  ({ stage }) =>
                    stage.id === tournamentPart.stage.previousStage?.id
                );

          return {
            key: tournamentPart.stage.id,
            children: (
              <Stage
                tournamentParts={{
                  current: tournamentPart,
                  previous: previousTournamentPart,
                }}
                highlightedClubId={highlightedClubId}
              />
            ),
            label: t(getStageTransKey(tournamentPart.stage.stageType)),
          };
        })}
        onChange={(key) => {
          startTransition(() => {
            setActiveKey(key);
          });
        }}
        expandIcon={({ isActive }) =>
          isPending ? (
            <LoadingOutlined />
          ) : (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )
        }
      />
    </Page>
  );
};

export { Tournament };
