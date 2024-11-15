import { FC, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import {
  getStageTransKey,
  getTournamentTitle,
  getWinner,
  isNotEmpty,
} from "@fbs2.0/utils";
import {
  StageInternal,
  StageType,
  Tournament as TournamentType,
} from "@fbs2.0/types";
import { Collapse, CollapseProps, Spin } from "antd";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { HighlightContext } from "../../context/highlightContext";
import { useHighlightContext } from "../../context/useHighlightContext";
import { Page } from "../../components/Page";
import { TournamentMenu } from "./components/TournamentMenu";
import { Header } from "./components/Header";
import { Participants } from "./components/Participants";
import { Stage } from "./components/Stage";
import { useGetTournamentStages } from "../../react-query-hooks/tournament/useGetTournamentStages";
import { useGetTournamentPartMatches } from "../../react-query-hooks/match/useGetTournamentPartMatches";

import styles from "./styles.module.scss";

const Tournament: FC = () => {
  const highlightedState = useHighlightContext();
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();
  const fetchings = useIsFetching();
  const mutatings = useIsMutating();

  const [participantsDialogOpened, setParticipantsDialogOpened] =
    useState(false);

  const [activeKey, setActiveKey] = useState<(number | string)[]>();

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as TournamentType,
    })
  )} ${season}`;

  const stages = useGetTournamentStages(season, tournament as TournamentType);

  const finalMatches = useGetTournamentPartMatches(
    season,
    tournament as TournamentType,
    stages.data?.find(({ stageType }) => stageType === StageType.FINAL) ?? null
  );

  const { results, forceWinnerId, host } = {
    ...finalMatches.data?.A?.tours?.["1"]?.[0],
  };

  const winnerInfo = getWinner(
    results || [],
    !!stages.data?.find(({ stageType }) => stageType === StageType.FINAL)
      ?.stageScheme.awayGoal,
    isNotEmpty(forceWinnerId)
      ? forceWinnerId === host?.id
        ? "guest"
        : "host"
      : undefined
  );

  const items: CollapseProps["items"] = useMemo(
    () =>
      stages.data?.map((stage, index, stages) => ({
        key: stage.id,
        classNames: { header: styles["collapse-header"] },
        label: t(getStageTransKey(stage.stageType)),
        children: (
          <Stage
            stage={stage as StageInternal}
            previousStages={[
              (stages[index - 1] as StageInternal) || null,
              (stages[index - 2] as StageInternal) || null,
            ]}
          />
        ),
      })),
    [stages.data, t]
  );

  return (
    <HighlightContext.Provider value={highlightedState}>
      <Page
        title={title}
        menu={<TournamentMenu />}
        className={styles[`tournament-${tournament}`]}
      >
        <Spin fullscreen spinning={fetchings > 0 || mutatings > 0} />
        <Header
          title={title}
          season={season}
          tournament={tournament}
          onParticipants={() => setParticipantsDialogOpened(true)}
        />
        <Participants
          onClose={() => setParticipantsDialogOpened(false)}
          open={participantsDialogOpened}
          finished={winnerInfo.host || winnerInfo.guest}
        />
        <Collapse
          bordered={false}
          collapsible="header"
          activeKey={activeKey}
          items={items}
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
    </HighlightContext.Provider>
  );
};

export { Tournament };
