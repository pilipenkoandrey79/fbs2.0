import { KnockoutStageTableRowResult, Match } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  match: KnockoutStageTableRowResult | Match;
}

const Score: FC<Props> = ({
  match: {
    unplayed,
    hostScore,
    guestScore,
    tech,
    replayDate,
    hostPen,
    guestPen,
  },
}) => {
  const { t } = useTranslation();

  return unplayed
    ? "-"
    : `${hostScore}:${guestScore}${tech ? "*" : ""} ${
        !replayDate && isNotEmpty(hostPen) && isNotEmpty(guestPen)
          ? t("tournament.stages.matches.pen", {
              h: hostPen,
              g: guestPen,
            })
          : ""
      }`;
};

export { Score };
