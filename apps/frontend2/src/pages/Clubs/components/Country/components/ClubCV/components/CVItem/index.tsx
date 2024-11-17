import { ClubCV, StageType, Tournament } from "@fbs2.0/types";
import { Card, Flex, Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { TournamentBadge } from "../../../../../../../../components/TournamentBadge";

import styles from "./styles.module.scss";

interface Props {
  entries: ClubCV[];
}

const CVItem: FC<Props> = ({ entries }) => {
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
          .map(({ tournamentSeason, start, finish, isWinner }) => (
            <Flex
              align="center"
              key={tournamentSeason.id}
              className={classNames({
                [styles.winner]: isWinner,
                [styles.finalist]:
                  finish === StageType.FINAL && isWinner === false,
              })}
            >
              <div className={styles.badge}>
                <TournamentBadge tournamentSeason={tournamentSeason} />
              </div>
              <div className={styles.value}>
                <Typography.Text ellipsis>
                  {t(
                    `tournament.stage.${start}${
                      start === StageType.GROUP || start === StageType.GROUP_2
                        ? ".short"
                        : ""
                    }`
                  )}
                </Typography.Text>
              </div>
              <div className={styles.value}>
                <Typography.Text ellipsis>
                  {t(
                    `tournament.stage.${finish}${
                      finish === StageType.GROUP || finish === StageType.GROUP_2
                        ? ".short"
                        : ""
                    }`
                  )}
                </Typography.Text>
              </div>
            </Flex>
          ))}
      </Flex>
    </Card>
  );
};

export { CVItem };
