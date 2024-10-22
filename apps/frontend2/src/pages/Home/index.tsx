import {
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, Slider, Spin, Timeline } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

import { Page } from "../../components/Page";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { getAvailableSeasonsKeys, getSliderMarks } from "./utils";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";

const Home: FC = () => {
  const { t } = useTranslation();
  const availableTournaments = useGetTournamentSeasons(false);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const [filteredSeasons, setFilteredSeasons] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number[]>();

  const { marks, max, min } = useMemo(
    () => getSliderMarks(availableTournaments.data, isMdScreen ? 10 : 30),
    [availableTournaments.data, isMdScreen]
  );

  const defaultSeasons = useMemo(
    () => getAvailableSeasonsKeys(availableTournaments.data),
    [availableTournaments.data]
  );

  const onSliderChange = useCallback(
    (value: SetStateAction<number[] | undefined>) => {
      setSliderValue(value);

      const [start, end] = [...(value as number[])];

      setFilteredSeasons(
        defaultSeasons.filter((season) => {
          const year = Number(season.split("-")[0]);

          return year <= (end || 0) && year >= (start || 0);
        })
      );
    },
    [defaultSeasons]
  );

  useEffect(() => {
    setFilteredSeasons(defaultSeasons);
  }, [availableTournaments.data, defaultSeasons]);

  useEffect(() => {
    setSliderValue([min, max]);
  }, [max, min]);

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
              onChange={onSliderChange}
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
                <div
                  style={{
                    border: "1px solid #dfdfdf",
                    height: 50,
                    width: 200,
                  }}
                >
                  {season}
                </div>
              ),
            }))}
            className={styles.timeline}
          />
        )}
      </div>
    </Page>
  );
};

export { Home };
