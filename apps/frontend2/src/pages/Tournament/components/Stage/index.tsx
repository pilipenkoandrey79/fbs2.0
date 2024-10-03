import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { TournamentDataRow } from "@fbs2.0/types";
import { Segmented } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

import { Participants } from "./components/Participants";

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
  const [segment, setSegment] = useState(Segments.results);

  return (
    <div>
      <Segmented
        options={[
          {
            label: t("tournament.stages.participants.title"),
            value: Segments.participants,
            icon: <BarsOutlined />,
          },
          {
            label: t("tournament.stages.results"),
            value: Segments.results,
            icon: <AppstoreOutlined />,
          },
        ]}
        onChange={setSegment}
        value={segment}
      />
      <div>
        {segment === Segments.participants ? (
          <Participants
            tournamentParts={tournamentParts}
            highlightedClubId={highlightedClubId}
          />
        ) : (
          <>Results</>
        )}
      </div>
    </div>
  );
};

export { Stage };
