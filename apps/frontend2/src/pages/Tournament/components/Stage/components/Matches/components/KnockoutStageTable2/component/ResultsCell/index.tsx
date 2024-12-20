import { ClubWithWinner, StageSchemeType, StageTableRow } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Tooltip, Typography } from "antd";
import { dateRenderer } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Score } from "../../../../../../../../../../components/Score";

import styles from "./styles.module.scss";

interface Props {
  results: StageTableRow["results"];
  forceWinnerId: number | null | undefined;
  host: ClubWithWinner;
  guest: ClubWithWinner;
}

const ResultsCell: FC<Props> = ({ results, forceWinnerId, host, guest }) => {
  const { t } = useTranslation();

  return (
    <td className={styles.cell}>
      <div className={styles.results}>
        {results.map((match) => {
          const { date, replayDate, hostPen, guestPen } = match;

          return (
            <div
              key={date}
              className={classNames(styles.match, {
                [styles["only-match"]]: !replayDate,
              })}
            >
              <div className={styles.result}>
                <Typography.Text className={styles.date} type="secondary">
                  {dateRenderer(date)}
                </Typography.Text>
                <span className={styles.score}>
                  <Score match={match} />
                </span>
              </div>
              {replayDate && (
                <div
                  className={classNames(styles.result, {
                    [styles.coin]: forceWinnerId,
                  })}
                >
                  <Typography.Text className={styles.date} type="secondary">
                    {dateRenderer(replayDate)}
                  </Typography.Text>
                  <span className={styles.score}>
                    {forceWinnerId ? (
                      <Tooltip
                        title={t("tournament.stages.matches.coin", {
                          club: [host, guest].find(
                            ({ id }) => id === forceWinnerId,
                          )?.club.name,
                        })}
                      >{`${hostPen}:${guestPen}`}</Tooltip>
                    ) : (
                      `${hostPen}:${guestPen}`
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </td>
  );
};

export { ResultsCell };
