import { Stage, StageType } from "@fbs2.0/types";
import { getTournamentTitle } from "@fbs2.0/utils";
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
    t(
      `tournament.stage.${fromStage?.stageType}${
        fromStage?.stageType === StageType.GROUP ||
        fromStage?.stageType === StageType.GROUP_2
          ? ".short"
          : ""
      }`
    );

  return (
    <Typography.Text type="secondary" ellipsis={{ tooltip: text }}>
      {text}
    </Typography.Text>
  );
};

export { FromCell };
