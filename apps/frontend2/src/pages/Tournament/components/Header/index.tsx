import { FC, useContext, useMemo, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, Link } from "react-router-dom";
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { Button, Typography } from "antd";

import { TournamentLogo } from "../../../../components/TournamentLogo";
import { ParticipantSelector } from "../ParticipantSelector";
import { Paths } from "../../../../routes";
import { HighlightContext } from "../../../../context/highlightContext";
import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";

import styles from "./styles.module.scss";

interface Props {
  title: string;
  season: string | undefined;
  tournament: string | undefined;
  onParticipants: () => void;
}

const Header: FC<Props> = ({ title, season, tournament, onParticipants }) => {
  const { t } = useTranslation();
  const { highlightId, setHighlightId } = useContext(HighlightContext);
  const [isPending, startTransition] = useTransition();
  const { data: availableTournaments } = useGetTournamentSeasons();
  const { data: participants } = useGetParticipants(season, tournament);

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
        <TournamentLogo />
        <h1>{title}</h1>
      </div>
      <div className={styles.panel}>
        <div className={styles.nav}>
          <Link
            to={previousLink || ""}
            className={classNames({ disabled: !previousLink })}
            onClick={() => setHighlightId(null)}
          >
            <LeftOutlined />
            {t("tournament.nav.back")}
          </Link>

          <Link
            to={nextLink || ""}
            className={classNames({ disabled: !nextLink })}
            onClick={() => setHighlightId(null)}
          >
            {t("tournament.nav.next")}
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
          {`${t("tournament.participants.title")} (${
            participants?.length || 0
          })`}
        </Button>
      </div>
      <div className={styles.highlight}>
        <Typography.Text>{t("tournament.highlight")}</Typography.Text>
        <ParticipantSelector
          formItem={false}
          allowClear
          value={highlightId}
          onChange={(value) => setHighlightId(value ?? null)}
          onClear={() => setHighlightId(null)}
        />
      </div>
    </div>
  );
};

export { Header };
