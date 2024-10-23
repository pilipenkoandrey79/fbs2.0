import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Slider, Spin, Timeline } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import {
  createSearchParams,
  ParamKeyValuePair,
  useSearchParams,
} from "react-router-dom";
import {
  SEASON_FROM_SEARCH_PARAM,
  SEASON_TO_SEARCH_PARAM,
  TournamentSeason,
} from "@fbs2.0/types";

import { Page } from "../../components/Page";
import { Season } from "./components/Season";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { getAvailableSeasonsKeys, getSliderMarks } from "./utils";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";
import { Tournament } from "./components/Tournament";

const Home: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const from = Number(searchParams.get(SEASON_FROM_SEARCH_PARAM));
  const to = Number(searchParams.get(SEASON_TO_SEARCH_PARAM));

  const { t } = useTranslation();
  const availableTournaments = useGetTournamentSeasons(false);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const [filteredSeasons, setFilteredSeasons] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number[]>();

  const [tournamentToEdit, setTournamentToEdit] =
    useState<TournamentSeason | null>(null);

  const { marks, max, min } = useMemo(
    () => getSliderMarks(availableTournaments.data, isMdScreen ? 10 : 20),
    [availableTournaments.data, isMdScreen]
  );

  const defaultSeasons = useMemo(
    () => getAvailableSeasonsKeys(availableTournaments.data),
    [availableTournaments.data]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const [start, end] = [...(sliderValue || [])];

      setFilteredSeasons(
        defaultSeasons.filter((season) => {
          const year = Number(season.split("-")[0]);

          return year <= (end || 0) && year >= (start || 0);
        })
      );
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [defaultSeasons, sliderValue]);

  useEffect(() => {
    if (!sliderValue && availableTournaments.isSuccess) {
      setSliderValue([
        Number.isNaN(from) || !from ? min : from,
        Number.isNaN(to) || !to ? max : to,
      ]);
    }
  }, [availableTournaments.isSuccess, from, max, min, sliderValue, to]);

  useEffect(() => {
    const [start, end] = [...(sliderValue || [])];

    if (!start || !end) {
      return;
    }

    if (
      Number.isNaN(from) ||
      from !== start ||
      Number.isNaN(to) ||
      to !== end
    ) {
      const params: ParamKeyValuePair[] = [
        [SEASON_FROM_SEARCH_PARAM, `${start}`],
        [SEASON_TO_SEARCH_PARAM, `${end}`],
      ];

      setSearchParams(createSearchParams(params), { replace: true });
    }
  }, [from, setSearchParams, sliderValue, to]);

  return (
    <Page title={t("home.title")}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.slider}>
            <Slider
              range={{ draggableTrack: true }}
              value={sliderValue}
              max={max}
              min={min}
              marks={marks}
              onChange={setSliderValue}
              disabled={availableTournaments.isLoading}
            />
          </div>
          <Button
            type="primary"
            size="large"
            title={t("home.create")}
            icon={<PlusOutlined />}
          >
            {isMdScreen ? t("home.create") : ""}
          </Button>
        </div>
        {availableTournaments.isLoading ? (
          <div className={styles.timeline}>
            <Spin size="large" className={styles.spin} />
          </div>
        ) : (
          <Timeline
            items={filteredSeasons.map((season) => ({
              key: season,
              children: (
                <Season
                  season={season}
                  tournaments={availableTournaments.data?.[season]}
                  onEdit={setTournamentToEdit}
                />
              ),
            }))}
            className={styles.timeline}
          />
        )}
        {tournamentToEdit !== null && (
          <Tournament
            tournamentSeason={tournamentToEdit}
            onClose={() => setTournamentToEdit(null)}
          />
        )}
      </div>
    </Page>
  );
};

export { Home };
