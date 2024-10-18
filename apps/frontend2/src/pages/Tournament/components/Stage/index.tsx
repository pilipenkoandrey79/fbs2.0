import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  GROUP_STAGES,
  Participant,
  StageSchemeType,
  TournamentPart,
} from "@fbs2.0/types";
import { Divider, Segmented } from "antd";
import { FC, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import { Participants } from "./components/Participants";
import { Matches } from "./components/Matches";
import { Standings } from "./components/Standings";

import styles from "./styles.module.scss";
import variables from "../../../../style/variables.module.scss";

export interface StageProps {
  tournamentPart: TournamentPart;
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[];
  };
  loading: boolean;
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

const Stage: FC<StageProps> = ({ tournamentPart, participants, loading }) => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.matches);

  const [seconsarySegment, setSecondarySegment] = useState(
    SecondarySegments.standings
  );

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const hasTable = [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
    tournamentPart.stage.stageScheme.type
  );

  return (
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
          disabled={loading}
        />
      )}
      <div
        className={classNames(styles.content, { [styles.panels]: isMdScreen })}
      >
        <Participants
          currentStage={tournamentPart.stage}
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
                  icon: isPending ? <LoadingOutlined /> : <AppstoreOutlined />,
                },
              ]}
              onChange={(value: SecondarySegments) =>
                setSecondarySegment(value)
              }
              value={seconsarySegment}
              disabled={loading}
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
                tournamentPart={tournamentPart}
                loading={loading}
              />
            )}
            <Matches
              visible={
                isMdScreen && hasTable
                  ? seconsarySegment === SecondarySegments.matches
                  : segment === Segments.matches
              }
              tournamentPart={tournamentPart}
              participants={participants}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Stage };
