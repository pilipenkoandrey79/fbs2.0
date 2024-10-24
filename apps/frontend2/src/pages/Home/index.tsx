import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Drawer, Slider, Spin, Timeline } from "antd";
import {
  ColumnWidthOutlined,
  PlusOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
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
import { Tournament } from "./components/Tournament";
import { Winners } from "./components/Winners";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { DEFAULT_MIN_SLIDER_VALUE, getSliderMarks } from "./utils";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";

export const DEBOUNCE_TIMEOUT = 300;

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
  const [isWinnersOpen, setIsWinnersOpen] = useState(isMdScreen);

  const [tournamentToEdit, setTournamentToEdit] =
    useState<TournamentSeason | null>(null);

  const { marks, max, min } = useMemo(
    () => getSliderMarks(availableTournaments.data, isMdScreen ? 10 : 20),
    [availableTournaments.data, isMdScreen]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const [start, end] = [...(sliderValue || [])];

      setFilteredSeasons(
        Object.keys(availableTournaments.data || {}).filter((season) => {
          const year = Number(season.split("-")[0]);

          return year <= (end || 0) && year >= (start || 0);
        })
      );
    }, DEBOUNCE_TIMEOUT);

    return () => {
      clearTimeout(handler);
    };
  }, [availableTournaments.data, sliderValue]);

  useEffect(() => {
    if (!sliderValue && availableTournaments.isSuccess) {
      setSliderValue([
        Number.isNaN(from) || !from ? DEFAULT_MIN_SLIDER_VALUE : from,
        Number.isNaN(to) || !to ? max : to,
      ]);
    }
  }, [availableTournaments.isSuccess, from, max, min, sliderValue, to]);

  useEffect(() => {
    const handler = setTimeout(() => {
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
    }, DEBOUNCE_TIMEOUT);

    return () => {
      clearTimeout(handler);
    };
  }, [from, setSearchParams, sliderValue, to]);

  return (
    <Page title={t("home.title")}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.buttons}>
            <Button
              type="primary"
              size="large"
              title={t("home.create")}
              icon={<PlusOutlined />}
            >
              {isMdScreen ? t("home.create") : ""}
            </Button>
            <Button
              type="default"
              size="large"
              title={t("home.expand")}
              icon={<ColumnWidthOutlined />}
              disabled={sliderValue?.[0] === min && sliderValue?.[1] === max}
              onClick={() => setSliderValue([min, max])}
            >
              {isMdScreen ? t("home.expand") : ""}
            </Button>
            {!isMdScreen && (
              <Button
                type="default"
                size="large"
                title={t("home.winners")}
                icon={<TrophyOutlined />}
                onClick={() => setIsWinnersOpen(true)}
              />
            )}
          </div>
          <div className={styles["slider-holder"]}>
            <div
              className={styles.slider}
              style={{
                display:
                  availableTournaments.isSuccess && marks ? "block" : "none",
              }}
            >
              <Slider
                range={{ draggableTrack: true }}
                value={sliderValue}
                max={max}
                min={min}
                marks={marks}
                onChange={setSliderValue}
              />
            </div>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.timeline}>
            {availableTournaments.isLoading ? (
              <Spin size="large" className={styles.spin} />
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
          {isMdScreen ? (
            <div className={styles.winners}>
              <Winners />
            </div>
          ) : (
            <Drawer
              open={isWinnersOpen}
              onClose={() => setIsWinnersOpen(false)}
              maskClosable={false}
              title={t("home.winners")}
            >
              <Winners />
            </Drawer>
          )}
        </div>
      </div>
    </Page>
  );
};

export { Home };
