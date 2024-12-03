import { Button, Card, Divider, Popconfirm, Skeleton } from "antd";
import { FC, useContext } from "react";
import {
  AvailableTournament,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  TournamentSeason,
} from "@fbs2.0/types";
import { generatePath } from "react-router";
import { createSearchParams, Link } from "react-router";
import {
  DeleteOutlined,
  EditOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { TournamentBadge } from "../../../../components/TournamentBadge";
import { Paths } from "../../../../routes";
import { UserContext } from "../../../../context/userContext";
import { Club } from "../../../../components/Club";
import { useDeleteTournament } from "../../../../react-query-hooks/tournament/useDeleteTournament";
import { useGetSeasonSummary } from "../../../../react-query-hooks/tournament/useGetSeasonSummary";

import styles from "./styles.module.scss";

interface Props {
  season: string;
  narrow: boolean;
  tournaments: AvailableTournament[] | undefined;
  onEdit: (tournamentSeason: TournamentSeason) => void;
}

const Season: FC<Props> = ({ season, tournaments, narrow, onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [start, end] = season.split("-").map(Number);

  const deleteTournament = useDeleteTournament(season);
  const summary = useGetSeasonSummary(season);

  return (
    <Card className={styles.card}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.years}>
            <span className={styles.start}>{start}</span>
            <span className={styles.end}>{end}</span>
          </div>
          <Divider type="vertical" className={styles.divider} />
          <div className={styles.tournaments}>
            <ul>
              {tournaments?.map(({ id, type }) => {
                const tournamentSummary = summary.data?.find(
                  (item) => item.type === type
                );

                return (
                  <li key={id} className={styles.tournament}>
                    <TournamentBadge
                      tournamentSeason={{ id, tournament: type, season }}
                      linkTo={generatePath(Paths.TOURNAMENT, {
                        season,
                        tournament: type,
                      })}
                    />
                    {user?.isEditor && summary.isSuccess && (
                      <div className={styles.tools}>
                        <Button
                          title={t("common.edit")}
                          icon={<EditOutlined />}
                          type="link"
                          size="small"
                          onClick={() =>
                            onEdit({ id, tournament: type, season })
                          }
                        />
                        <Popconfirm
                          title={t("common.delete")}
                          disabled={tournamentSummary?.hasMatches}
                          onConfirm={async () =>
                            await deleteTournament.mutateAsync(id)
                          }
                        >
                          <Button
                            title={t("common.delete")}
                            icon={<DeleteOutlined />}
                            danger
                            type="link"
                            size="small"
                            disabled={tournamentSummary?.hasMatches}
                          />
                        </Popconfirm>
                      </div>
                    )}
                    <Divider type="vertical" className={styles.divider} />
                    {summary.isLoading && (
                      <Skeleton.Input size="small" active />
                    )}
                    {tournamentSummary?.winner && (
                      <div
                        className={classNames(styles.final, {
                          [styles.narrow]: narrow,
                        })}
                      >
                        <Club
                          club={tournamentSummary?.winner?.club}
                          className={styles.winner}
                          to={
                            generatePath(Paths.TOURNAMENT, {
                              season,
                              tournament: type,
                            }) +
                            `?${createSearchParams([
                              [
                                HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
                                `${tournamentSummary?.winner?.club?.id}`,
                              ],
                            ])}`
                          }
                        />
                        {tournamentSummary?.finalist && (
                          <Club
                            club={tournamentSummary?.finalist?.club}
                            className={styles.finalist}
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className={styles.coeff}>
          <Divider type="vertical" className={styles.divider} />
          <Link to={generatePath(Paths.COEFFICIENT, { season })}>
            <OrderedListOutlined />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export { Season };
