import {
  ClubWithWinner,
  GROUP_STAGES,
  ONE_MATCH_STAGES,
  StageSchemeType,
  StageTableRow,
} from "@fbs2.0/types";
import { FC, useContext } from "react";
import classNames from "classnames";
import { Button, Tooltip, Typography } from "antd";
import { dateRenderer, isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";
import { EditFilled, PlusOutlined } from "@ant-design/icons";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { UserContext } from "../../../../../../../../../../context/userContext";
import { Score } from "../../../../../../../../../../components/Score";

import styles from "./styles.module.scss";

interface Props {
  results: StageTableRow["results"];
  forceWinnerId: number | null | undefined;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  adding: boolean;
  stageSchemeType: StageSchemeType;

  onEdit: (date: string) => void;
}

const ResultsCell: FC<Props> = ({
  results,
  forceWinnerId,
  host,
  guest,
  adding,
  stageSchemeType,
  onEdit,
}) => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const fetchings = useIsFetching();
  const mutatings = useIsMutating();

  const canAddResult =
    !isNotEmpty(forceWinnerId) &&
    results.length <
      ([...ONE_MATCH_STAGES, ...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
        stageSchemeType,
      )
        ? 1
        : 2);

  return (
    <div className={styles.results}>
      {results.length > 0 ? (
        results.map((match) => {
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
              {!adding && user?.isEditor && (
                <>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditFilled />}
                    className={styles["edit-button"]}
                    onClick={() => onEdit(date)}
                    disabled={fetchings > 0 || mutatings > 0}
                  />
                  {canAddResult && (
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      className={styles["add-button"]}
                      onClick={() => onEdit("")}
                      disabled={fetchings > 0 || mutatings > 0}
                    />
                  )}
                </>
              )}
            </div>
          );
        })
      ) : (
        <div className={styles.match}>
          {!adding && user?.isEditor && canAddResult && (
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              className={styles["add-button"]}
              onClick={() => onEdit("")}
              disabled={fetchings > 0 || mutatings > 0}
            />
          )}
        </div>
      )}
    </div>
  );
};

export { ResultsCell };
