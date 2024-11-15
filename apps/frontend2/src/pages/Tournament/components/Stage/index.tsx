import { Divider, Segmented, Skeleton } from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  GROUP_STAGES,
  StageInternal,
  StageSchemeType,
  Tournament,
} from "@fbs2.0/types";
import { FC, useState, useTransition } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import { Participants } from "./components/Participants";
import { Standings } from "./components/Standings";
import { Matches } from "./components/Matches";
import { useGetTournamentPartMatches } from "../../../../react-query-hooks/match/useGetTournamentPartMatches";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { prepareStageParticipants } from "./utils";

import variables from "../../../../style/variables.module.scss";
import styles from "./styles.module.scss";

interface Props {
  stage: StageInternal;
  previousStages: [StageInternal | null, StageInternal | null];
}

enum Segments {
  matches = "matches",
  participants = "participants",
  tables = "tables",
}

enum SecondarySegments {
  standings = "standings",
  matches = "matches",
}

const Stage: FC<Props> = ({ stage, previousStages }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();

  const currentStageMatches = useGetTournamentPartMatches(
    season,
    tournament as Tournament,
    stage
  );

  const previousStageMatches = useGetTournamentPartMatches(
    season,
    tournament as Tournament,
    previousStages[0]
  );

  const prePreviousStageMatches = useGetTournamentPartMatches(
    season,
    tournament as Tournament,
    previousStages[1]
  );

  const tournamentParticipants = useGetParticipants(season, tournament);

  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.matches);

  const [seconsarySegment, setSecondarySegment] = useState(
    SecondarySegments.standings
  );

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const hasTable = [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
    stage.stageScheme.type
  );

  const participants = prepareStageParticipants(
    tournamentParticipants.data,
    currentStageMatches.data
      ? { matches: currentStageMatches.data, stage }
      : undefined,
    previousStageMatches.data && previousStages[0]
      ? { matches: previousStageMatches.data, stage: previousStages[0] }
      : undefined,
    prePreviousStageMatches.data && previousStages[1]
      ? { matches: prePreviousStageMatches.data, stage: previousStages[1] }
      : undefined
  );

  return [
    currentStageMatches,
    previousStageMatches,
    prePreviousStageMatches,
  ].some(({ isPending }) => isPending) ? (
    <Skeleton active />
  ) : (
    currentStageMatches.data && (
      <div>
        {!isMdScreen && (
          <Segmented
            options={[
              {
                label: t("tournament.stages.participants.title"),
                value: Segments.participants,
                icon: isPending ? <LoadingOutlined /> : <BarsOutlined />,
              },
              ...(hasTable
                ? [
                    {
                      label: t("tournament.stages.tables.title"),
                      value: Segments.tables,
                      icon: isPending ? <LoadingOutlined /> : <TableOutlined />,
                    },
                  ]
                : []),
              {
                label: t("tournament.stages.matches.title"),
                value: Segments.matches,
                icon: isPending ? <LoadingOutlined /> : <AppstoreOutlined />,
              },
            ]}
            onChange={(value: Segments) => {
              startTransition(() => {
                setSegment(value);
              });
            }}
            value={segment}
          />
        )}
        <div
          className={classNames(styles.content, {
            [styles.panels]: isMdScreen,
          })}
        >
          <Participants
            currentStage={stage}
            participants={participants}
            visible={isMdScreen || segment === Segments.participants}
          />
          <Divider type="vertical" className={styles.divider} />
          <div>
            {isMdScreen && hasTable && (
              <Segmented
                options={[
                  {
                    label: t("tournament.stages.tables.title"),
                    value: SecondarySegments.standings,
                    icon: isPending ? <LoadingOutlined /> : <TableOutlined />,
                  },
                  {
                    label: t("tournament.stages.matches.title"),
                    value: SecondarySegments.matches,
                    icon: isPending ? (
                      <LoadingOutlined />
                    ) : (
                      <AppstoreOutlined />
                    ),
                  },
                ]}
                onChange={(value: SecondarySegments) =>
                  setSecondarySegment(value)
                }
                value={seconsarySegment}
              />
            )}
            <div className={styles.results}>
              {hasTable && (
                <Standings
                  visible={
                    isMdScreen
                      ? seconsarySegment === SecondarySegments.standings
                      : segment === Segments.tables
                  }
                  tournamentPart={{ matches: currentStageMatches.data, stage }}
                />
              )}
              <Matches
                visible={
                  isMdScreen && hasTable
                    ? seconsarySegment === SecondarySegments.matches
                    : segment === Segments.matches
                }
                tournamentPart={{ matches: currentStageMatches.data, stage }}
                participants={participants}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export { Stage };
