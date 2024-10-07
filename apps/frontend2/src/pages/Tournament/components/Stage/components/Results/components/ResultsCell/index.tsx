import { ClubWithWinner, StageTableRow } from "@fbs2.0/types";
import { FC, useContext } from "react";
import classNames from "classnames";
import { Button, Tooltip, Typography } from "antd";
import { dateRenderer, isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";
import { EditFilled, PlusOutlined } from "@ant-design/icons";

import { UserContext } from "../../../../../../../../context/userContext";

import styles from "./styles.module.scss";

interface Props {
  results: StageTableRow["results"];
  forceWinnerId: number | null | undefined;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  adding: boolean;
}

const ResultsCell: FC<Props> = ({
  results,
  forceWinnerId,
  host,
  guest,
  adding,
}) => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  return (
    <div className={styles.results}>
      {results.map(
        ({ date, hostScore, guestScore, replayDate, hostPen, guestPen }) =>
          date ? (
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
                <span className={styles.score}>{`${hostScore}:${guestScore} ${
                  !replayDate && isNotEmpty(hostPen) && isNotEmpty(guestPen)
                    ? t("tournament.stages.results.pen", {
                        h: hostPen,
                        g: guestPen,
                      })
                    : ""
                }`}</span>
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
                        title={t("tournament.stages.results.coin", {
                          club: [host, guest].find(
                            ({ id }) => id === forceWinnerId
                          )?.club.name,
                        })}
                      >{`${hostPen}:${guestPen}`}</Tooltip>
                    ) : (
                      `${hostPen}:${guestPen}`
                    )}
                  </span>
                </div>
              )}
              {!adding && user?.isEditor && (
                <Button
                  type="link"
                  icon={<EditFilled />}
                  className={styles["edit-button"]}
                />
              )}
            </div>
          ) : (
            <div key={`empty-${host.id}-${guest.id}`}>
              {!adding && user?.isEditor && (
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  className={styles["edit-button"]}
                />
              )}
            </div>
          )
      )}
    </div>
  );
};

export { ResultsCell };
