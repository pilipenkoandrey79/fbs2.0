import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { TournamentDataRow } from "@fbs2.0/types";
import { Divider, Segmented } from "antd";
import { FC, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import { Participants } from "./components/Participants";
import { Results } from "./components/Results";

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
  const [isPending, startTransition] = useTransition();
  const [segment, setSegment] = useState(Segments.results);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

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
          visible={isMdScreen || segment === Segments.participants}
        />
        <Divider type="vertical" className={styles.divider} />
        <Results
          visible={isMdScreen || segment === Segments.results}
          tournamentPart={tournamentParts.current}
          highlightedClubId={highlightedClubId}
        />
      </div>
    </div>
  );
};

export { Stage };
