import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { TournamentDataRow } from "@fbs2.0/types";
import { Divider, Segmented } from "antd";
import { FC, useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import { useParams } from "react-router";

import { Participants } from "./components/Participants";
import { Results } from "./components/Results";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { prepareStageParticipants } from "./utils";

import styles from "./styles.module.scss";
import variables from "../../../../style/variables.module.scss";

interface Props {
  tournamentParts: {
    current: TournamentDataRow;
    previous: TournamentDataRow | undefined;
  };
  highlightedClubId: number | null;
}

enum Segments {
  results = "results",
  participants = "participants",
}

const Stage: FC<Props> = ({ tournamentParts, highlightedClubId }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.results);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const participants = useGetParticipants(season, tournament);

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
            {
              label: t("tournament.stages.results.title"),
              value: Segments.results,
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
      <div className={classNames({ [styles.panels]: isMdScreen })}>
        <Participants
          tournamentParts={tournamentParts}
          highlightedClubId={highlightedClubId}
          seeded={seeded}
          previousStageWinners={previousStageWinners}
          skippers={skippers}
          visible={isMdScreen || segment === Segments.participants}
        />
        <Divider type="vertical" className={styles.divider} />
        <Results
          visible={isMdScreen || segment === Segments.results}
          tournamentPart={tournamentParts.current}
          highlightedClubId={highlightedClubId}
          participants={filtered}
        />
      </div>
    </div>
  );
};

export { Stage };
