import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { StageSchemeType, TournamentPart } from "@fbs2.0/types";
import {
  getKnockoutStageMatchesData,
  transformGroupStage,
  transformLeagueStage,
} from "@fbs2.0/utils";
import { Segmented } from "antd";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  tournamentPart: TournamentPart;
}

enum Segments {
  results = "results",
  participants = "participants",
}

const Stage: FC<Props> = ({ tournamentPart }) => {
  const { t } = useTranslation();
  const [segment, setSegment] = useState(Segments.results);

  const matches = useMemo(() => {
    switch (tournamentPart.stage.stageScheme.type) {
      case StageSchemeType.OLYMPIC_1_MATCH:
      case StageSchemeType.OLYMPIC_2_MATCH:
        return getKnockoutStageMatchesData(tournamentPart);
      case StageSchemeType.GROUP_4_2_MATCH:
      case StageSchemeType.GROUP_5_1_MATCH:
      case StageSchemeType.GROUP_SEMI_FINAL:
      case StageSchemeType.GROUP_ICFC:
        return transformGroupStage(tournamentPart);
      case StageSchemeType.LEAGUE:
        return transformLeagueStage(tournamentPart);
      default:
        return [];
    }
  }, [tournamentPart]);

  return (
    <div>
      <Segmented
        options={[
          {
            label: t("tournament.stages.participants"),
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
        {segment === Segments.participants ? <>Participants</> : <>Results</>}
      </div>
    </div>
  );
};

export { Stage };
