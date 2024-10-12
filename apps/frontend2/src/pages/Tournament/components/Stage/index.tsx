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
}

enum Segments {
  matches = "matches",
  participants = "participants",
  tables = "tables",
}

const Stage: FC<Props> = ({ tournamentParts, highlightedClubId }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.matches);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const participants = useGetParticipants(season, tournament);

  const hasTable = [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
    tournamentParts.current.stage.stageScheme.type
  );

  const isGroupStage = GROUP_STAGES.includes(
    tournamentParts.current.stage.stageScheme.type
  );

  const { seeded, previousStageWinners, skippers, filtered } = useMemo(
    () =>
      prepareStageParticipants(
        participants.data,
        tournamentParts.current,
        tournamentParts.previous
      ),
    [participants.data, tournamentParts]
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
            ...(isGroupStage
              ? []
              : [
                  {
                    label: t("tournament.stages.matches.title"),
                    value: Segments.matches,
                    icon: isPending ? (
                      <LoadingOutlined />
                    ) : (
                      <AppstoreOutlined />
                    ),
                  },
                ]),
            ...(hasTable
              ? [
                  {
                    label: t("tournament.stages.tables.title"),
                    value: Segments.tables,
                    icon: isPending ? <LoadingOutlined /> : <TableOutlined />,
                  },
                ]
              : []),
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
        className={classNames(styles.content, { [styles.panels]: isMdScreen })}
      >
        <Participants
          currentStage={tournamentParts.current.stage}
          highlightedClubId={highlightedClubId}
          seeded={seeded}
          previousStageWinners={previousStageWinners}
          skippers={skippers}
          visible={isMdScreen || segment === Segments.participants}
        />
        <Divider type="vertical" className={styles.divider} />
        <div className={styles.results}>
          {hasTable && (
            <Standings visible={isMdScreen || segment === Segments.tables} />
          )}
          {!isGroupStage && (
            <Matches
              visible={isMdScreen || segment === Segments.matches}
              tournamentPart={tournamentParts.current}
              highlightedClubId={highlightedClubId}
              participants={filtered}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { Stage };
