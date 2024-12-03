import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, Link } from "react-router";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import classNames from "classnames";

import { Sorter } from "../Sorter";
import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { Paths } from "../../../../routes";

import styles from "./styles.module.scss";

interface Props {
  title: string;
  season: string | undefined;
}

const Header: FC<Props> = ({ title, season }) => {
  const { t } = useTranslation();
  const availableTournaments = useGetTournamentSeasons();

  const { previousLink, nextLink } = useMemo(() => {
    const [start, finish] = (season || "").split("-").map((v) => Number(v));
    const prevSeason = `${start - 1}-${finish - 1}`;
    const nextSeason = `${start + 1}-${finish + 1}`;

    const hasPrevSeason =
      (availableTournaments.data?.[prevSeason]?.length || 0) > 0;

    const hasNextSeason =
      (availableTournaments.data?.[nextSeason]?.length || 0) > 0;

    const previousLink = hasPrevSeason
      ? generatePath(Paths.COEFFICIENT, { season: prevSeason })
      : undefined;

    const nextLink = hasNextSeason
      ? generatePath(Paths.COEFFICIENT, { season: nextSeason })
      : undefined;

    return { previousLink, nextLink };
  }, [availableTournaments, season]);

  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      <div className={styles.panel}>
        <div className={styles.nav}>
          <Link
            to={previousLink || ""}
            className={classNames({ disabled: !previousLink })}
          >
            <LeftOutlined />
            {t("common.nav.back")}
          </Link>

          <Link
            to={nextLink || ""}
            className={classNames({ disabled: !nextLink })}
          >
            {t("common.nav.next")}
            <RightOutlined />
          </Link>
        </div>
        <Sorter />
      </div>
    </div>
  );
};

export { Header };
