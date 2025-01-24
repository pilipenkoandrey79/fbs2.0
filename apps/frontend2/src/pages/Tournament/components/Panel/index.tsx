import { Button } from "antd";
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { FC, useContext, useMemo, useTransition } from "react";
import { generatePath, Link } from "react-router";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Paths } from "../../../../routes";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { HighlightContext } from "../../../../context/highlightContext";

import styles from "./styles.module.scss";

interface Props {
  season: string | undefined;
  tournament: string | undefined;
  onParticipants: () => void;
}

const Panel: FC<Props> = ({ season, tournament, onParticipants }) => {
  const { t } = useTranslation();
  const availableTournaments = useGetTournamentSeasons();
  const { data: participants } = useGetParticipants(season, tournament);
  const { setHighlightId } = useContext(HighlightContext);
  const [isPending, startTransition] = useTransition();

  const { previousLink, nextLink } = useMemo(() => {
    const [start, finish] = (season || "").split("-").map((v) => Number(v));
    const prevSeason = `${start - 1}-${finish - 1}`;
    const nextSeason = `${start + 1}-${finish + 1}`;

    const prevSeasonTournament = availableTournaments.data?.[prevSeason]?.find(
      ({ type }) => type === tournament,
    );

    const nextSeasonTournament = availableTournaments.data?.[nextSeason]?.find(
      ({ type }) => type === tournament,
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
    <div className={styles.panel}>
      <div className={styles.nav}>
        <Link
          to={previousLink || ""}
          className={classNames({ disabled: !previousLink })}
          onClick={() => setHighlightId(null)}
        >
          <LeftOutlined />
          {t("common.nav.back")}
        </Link>

        <Link
          to={nextLink || ""}
          className={classNames({ disabled: !nextLink })}
          onClick={() => setHighlightId(null)}
        >
          {t("common.nav.next")}
          <RightOutlined />
        </Link>
      </div>
      <Button
        icon={isPending ? <LoadingOutlined /> : <TeamOutlined />}
        title={`${t("tournament.participants.title")} (${
          participants?.length || 0
        })`}
        onClick={() =>
          startTransition(() => {
            onParticipants();
          })
        }
      >
        {`${t("tournament.participants.title")} (${participants?.length || 0})`}
      </Button>
    </div>
  );
};

export { Panel };
