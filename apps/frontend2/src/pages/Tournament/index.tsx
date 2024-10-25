import { FC, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getStageTransKey, getTournamentTitle } from "@fbs2.0/utils";
import { Tournament as TournamentType } from "@fbs2.0/types";
import { Collapse, CollapseProps } from "antd";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";

import { HighlightContext } from "../../context/highlightContext";
import { useHighlightContext } from "../../context/useHighlightContext";
import { Page } from "../../components/Page";
import { TournamentMenu } from "./components/TournamentMenu";
import { Header } from "./components/Header";
import { Participants } from "./components/Participants";
import { Stage } from "./components/Stage";
import { useGetTournamentStages } from "../../react-query-hooks/tournament/useGetTournamentStages";

import styles from "./styles.module.scss";

const Tournament: FC = () => {
  const highlightedState = useHighlightContext();
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();

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

  const items: CollapseProps["items"] = stages.data?.map(
    (stage, index, stages) => ({
      key: stage.id,
      classNames: { header: styles["collapse-header"] },
      label: t(getStageTransKey(stage.stageType)),
      children: (
        <Stage
          stage={stage}
          previousStages={[
            stages[index - 1] || null,
            stages[index - 2] || null,
          ]}
        />
      ),
    })
  );

  return (
    <HighlightContext.Provider value={highlightedState}>
      <Page
        title={title}
        menu={<TournamentMenu />}
        className={styles[`tournament-${tournament}`]}
      >
        <Header
          title={title}
          season={season}
          tournament={tournament}
          onParticipants={() => setParticipantsDialogOpened(true)}
        />
        <Participants
          onClose={() => setParticipantsDialogOpened(false)}
          open={participantsDialogOpened}
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
