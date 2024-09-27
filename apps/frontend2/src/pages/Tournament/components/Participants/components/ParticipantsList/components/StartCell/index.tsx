import { Stage, StageType } from "@fbs2.0/types";
import { Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  startingStage: string;
  fromStage: Stage | null;
}

const StartCell: FC<Props> = ({ startingStage, fromStage }) => {
  const { t } = useTranslation();

  const text = t(
    `tournament.stage.${startingStage}${
      startingStage === StageType.GROUP || startingStage === StageType.GROUP_2
        ? ".short"
        : ""
    }`
  );

  return (
    <Typography.Text
      type={fromStage ? "secondary" : undefined}
      ellipsis={{ tooltip: text }}
    >
      {text}
    </Typography.Text>
  );
};

export { StartCell };
