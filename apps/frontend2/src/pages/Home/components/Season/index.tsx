import { Button, Card, Divider, Popconfirm } from "antd";
import { FC, useContext } from "react";
import {
  AvailableTournament,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  TournamentSeason,
} from "@fbs2.0/types";
import { generatePath } from "react-router";
import { createSearchParams, Link } from "react-router-dom";
import {
  DeleteOutlined,
  EditOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { TournamentBadge } from "../../../../components/TournamentBadge";
import { Paths } from "../../../../routes";
import { UserContext } from "../../../../context/userContext";
import { Club } from "../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  season: string;
  tournaments: AvailableTournament[] | undefined;
  onEdit: (tournamentSeason: TournamentSeason) => void;
}

const Season: FC<Props> = ({ season, tournaments, onEdit }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [start, end] = season.split("-").map(Number);

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.years}>
            <span className={styles.start}>{start}</span>
            <span className={styles.end}>{end}</span>
          </div>
          <Divider type="vertical" className={styles.divider} />
          <div className={styles.tournaments}>
            <ul>
              {tournaments?.map(
                ({ id, type, hasMatches, winner, finalist }) => (
                  <li key={id} className={styles.tournament}>
                    <TournamentBadge
                      tournamentSeason={{ id, tournament: type, season }}
                      linkTo={generatePath(Paths.TOURNAMENT, {
                        season,
                        tournament: type,
                      })}
                    />
                    <div className={styles.tools}>
                      {user?.isEditor && (
                        <Button
                          title={t("common.edit")}
                          icon={<EditOutlined />}
                          type="link"
                          onClick={() =>
                            onEdit({ id, tournament: type, season })
                          }
                        />
                      )}
                      {!hasMatches && (
                        <Popconfirm title={t("common.delete")}>
                          <Button
                            title={t("common.delete")}
                            icon={<DeleteOutlined />}
                            danger
                            type="link"
                          />
                        </Popconfirm>
                      )}
                    </div>
                    {winner && (
                      <div className={styles.final}>
                        <Link
                          to={
                            generatePath(Paths.TOURNAMENT, {
                              season,
                              tournament: type,
                            }) +
                            `?${createSearchParams([
                              [
                                HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
                                `${winner?.club?.id}`,
                              ],
                            ])}`
                          }
                        >
                          <Club club={winner?.club} className={styles.winner} />
                        </Link>
                        {finalist && (
                          <Club
                            club={finalist?.club}
                            className={styles.finalist}
                          />
                        )}
                      </div>
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className={styles.coeff}>
          <Divider type="vertical" className={styles.divider} />{" "}
          <Link to={generatePath(Paths.COEFFICIENT, { season })}>
            <OrderedListOutlined />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export { Season };
