import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, Link } from "react-router-dom";
import { LeftOutlined, RightOutlined, TeamOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { Button } from "antd";

import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { Paths } from "../../../../routes";

import styles from "./styles.module.scss";

interface Props {
  title: string;
  season: string | undefined;
  tournament: string | undefined;
  onParticipants: () => void;
}

const Header: FC<Props> = ({ title, season, tournament, onParticipants }) => {
  const { t } = useTranslation();

  const { data: availableTournaments } = useGetTournamentSeasons(true);

  const { previousLink, nextLink } = useMemo(() => {
    const [start, finish] = (season || "").split("-").map((v) => Number(v));
    const prevSeason = `${start - 1}-${finish - 1}`;
    const nextSeason = `${start + 1}-${finish + 1}`;

    const prevSeasonTournament = availableTournaments?.[prevSeason]?.find(
      ({ type }) => type === tournament
    );

    const nextSeasonTournament = availableTournaments?.[nextSeason]?.find(
      ({ type }) => type === tournament
    );

    const previousLink = prevSeasonTournament
      ? generatePath(Paths.TOURNAMENT, {
          season: prevSeason,
          tournament: prevSeasonTournament.type,
        })
      : undefined;

    const nextLink = nextSeasonTournament
      ? generatePath(Paths.TOURNAMENT, {
          season: nextSeason,
          tournament: nextSeasonTournament.type,
        })
      : undefined;

    return { previousLink, nextLink };
  }, [availableTournaments, season, tournament]);

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <h1>{title}</h1>
      </div>
      <div className={styles.panel}>
        <div className={styles.nav}>
          <Link
            to={previousLink || ""}
            className={classNames({ disabled: !previousLink })}
          >
            <LeftOutlined />
            {t("tournament.nav.back")}
          </Link>

          <Link
            to={nextLink || ""}
            className={classNames({ disabled: !nextLink })}
          >
            {t("tournament.nav.next")}
            <RightOutlined />
          </Link>
        </div>
        <Button
          icon={<TeamOutlined />}
          title={t("tournament.participants.title")}
          onClick={onParticipants}
        >
          {t("tournament.participants.title")}
        </Button>
      </div>
      <div className={styles.highlight}></div>
    </div>
  );
};

export { Header };
