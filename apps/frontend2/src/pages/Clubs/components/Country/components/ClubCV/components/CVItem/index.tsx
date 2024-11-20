import {
  ClubCV,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  StageType,
  Tournament,
} from "@fbs2.0/types";
import { Card, Flex, Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { generatePath } from "react-router";
import { createSearchParams } from "react-router-dom";

import { TournamentBadge } from "../../../../../../../../components/TournamentBadge";
import { Paths } from "../../../../../../../../routes";

import styles from "./styles.module.scss";

interface Props {
  entries: ClubCV[];
  clubId: number | undefined;
}

const CVItem: FC<Props> = ({ entries, clubId }) => {
  const { t } = useTranslation();

  const tournamentSequence = Object.values(Tournament).reduce<
    Record<Tournament, number>
  >(
    (acc, value, index) => ({ ...acc, [value]: index }),
    {} as Record<Tournament, number>
  );

  return (
    <Card size="small" className={styles.card}>
      <Flex vertical gap={4}>
        {entries
          .sort(
            (a, b) =>
              tournamentSequence[a.tournamentSeason.tournament] -
              tournamentSequence[b.tournamentSeason.tournament]
          )
          .map(({ tournamentSeason, start, finish, isWinner }) => {
            const startLabel = t(
              `tournament.stage.${start}${
                start === StageType.GROUP || start === StageType.GROUP_2
                  ? ".short"
                  : ""
              }`
            );

            const finishlabel = t(
              `tournament.stage.${finish}${
                finish === StageType.GROUP || finish === StageType.GROUP_2
                  ? ".short"
                  : ""
              }`
            );

            return (
              <Flex
                align="center"
                key={tournamentSeason.id}
                className={classNames(styles.row, {
                  [styles.winner]: isWinner,
                  [styles.finalist]:
                    finish === StageType.FINAL && isWinner === false,
                })}
              >
                <div className={styles.badge}>
                  <TournamentBadge
                    tournamentSeason={tournamentSeason}
                    linkTo={
                      generatePath(Paths.TOURNAMENT, {
                        season: tournamentSeason.season,
                        tournament: tournamentSeason.tournament,
                      }) +
                      `?${createSearchParams([
                        [HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${clubId}`],
                      ])}`
                    }
                  />
                </div>
                <div className={styles.value}>
                  <Typography.Text ellipsis={{ tooltip: startLabel }}>
                    {startLabel}
                  </Typography.Text>
                </div>
                <div className={styles.value}>
                  <Typography.Text ellipsis={{ tooltip: finishlabel }}>
                    {finishlabel}
                  </Typography.Text>
                </div>
              </Flex>
            );
          })}
      </Flex>
    </Card>
  );
};

export { CVItem };
