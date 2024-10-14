import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { GROUP_STAGES, StageSchemeType, TournamentPart } from "@fbs2.0/types";
import { Divider, Segmented } from "antd";
import { FC, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import { useParams } from "react-router";

import { Participants } from "./components/Participants";
import { Matches } from "./components/Matches";
import { Standings } from "./components/Standings";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { prepareStageParticipants } from "./utils";

import styles from "./styles.module.scss";
import variables from "../../../../style/variables.module.scss";

interface Props {
  tournamentParts: {
    current: TournamentPart;
    previous: TournamentPart | undefined;
  };
  highlightedClubId: number | null;
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

const Stage: FC<Props> = ({ tournamentParts, highlightedClubId, loading }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.matches);

  const [seconsarySegment, setSecondarySegment] = useState(
    SecondarySegments.standings
  );

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const rawParticipants = useGetParticipants(season, tournament);

  const hasTable = [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
    tournamentParts.current.stage.stageScheme.type
  );

  const participants = useMemo(
    () =>
      prepareStageParticipants(
        rawParticipants.data,
        tournamentParts.current,
        tournamentParts.previous
      ),
    [rawParticipants.data, tournamentParts]
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
          currentStage={tournamentParts.current.stage}
          highlightedClubId={highlightedClubId}
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
                tournamentPart={tournamentParts.current}
                highlightedClubId={highlightedClubId}
                loading={loading}
              />
            )}
            <Matches
              visible={
                isMdScreen && hasTable
                  ? seconsarySegment === SecondarySegments.matches
                  : segment === Segments.matches
              }
              tournamentPart={tournamentParts.current}
              highlightedClubId={highlightedClubId}
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
