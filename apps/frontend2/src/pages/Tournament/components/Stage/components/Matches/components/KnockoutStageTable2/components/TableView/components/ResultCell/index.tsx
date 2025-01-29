import { FC } from "react";
import classNames from "classnames";
import { StageTableRow } from "@fbs2.0/types";
import { dateRenderer } from "@fbs2.0/utils";
import { Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { Score } from "../../../../../../../../../../../../components/Score";
import { Language } from "../../../../../../../../../../../../i18n/locales";

import styles from "./styles.module.scss";

interface Props {
  match: StageTableRow;
}

const ResultCell: FC<Props> = ({ match }) => {
  const { t, i18n } = useTranslation();

  return (
    <td className={styles.results}>
      {
        <table
          className={classNames(styles["results-table"], {
            [styles["two-matches"]]: match.results.length > 1,
          })}
        >
          <tbody>
            {match.results.map((result) => (
              <tr key={result.date}>
                <td className={styles.date}>
                  <Typography.Paragraph type="secondary">
                    {dateRenderer(result.date)}
                  </Typography.Paragraph>
                  {result.replayDate && (
                    <Typography.Paragraph type="secondary">
                      {dateRenderer(result.replayDate)}
                    </Typography.Paragraph>
                  )}
                </td>
                <td className={styles.score}>
                  <div>
                    <Score match={result} />
                  </div>
                  {result.replayDate && (
                    <div
                      className={classNames({
                        [styles.coin]: match.forceWinnerId,
                      })}
                    >
                      {match.forceWinnerId ? (
                        <Tooltip
                          title={t("tournament.stages.matches.coin", {
                            club: [match.host, match.guest].find(
                              ({ id }) => id === match.forceWinnerId,
                            )?.club[
                              i18n.resolvedLanguage === Language.en
                                ? "name"
                                : "name_ua"
                            ],
                          })}
                        >{`${result.hostPen}:${result.guestPen}`}</Tooltip>
                      ) : (
                        `${result.hostPen}:${result.guestPen}`
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </td>
  );
};

export { ResultCell };
