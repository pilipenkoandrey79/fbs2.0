import { Stage } from "@fbs2.0/types";
import { getStageTransKey, getTournamentTitle } from "@fbs2.0/utils";
import { Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

interface Props {
  fromStage: Stage | null;
}

const FromCell: FC<Props> = ({ fromStage }) => {
  const { t } = useTranslation();
  const { season } = useParams();

  if (!fromStage) {
    return null;
  }

  const text =
    t(
      getTournamentTitle(
        {
          season,
          tournament: fromStage.tournamentSeason.tournament,
        },
        { short: true }
      )
    ) +
    ": " +
    t(getStageTransKey(fromStage.stageType));

  return (
    <Typography.Text type="secondary" ellipsis={{ tooltip: text }}>
      {text}
    </Typography.Text>
  );
};

export { FromCell };
