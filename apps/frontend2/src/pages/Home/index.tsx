import {
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, Skeleton, Slider, Spin, Timeline } from "antd";
import { PlusOutlined, TrophyOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import {
  createSearchParams,
  ParamKeyValuePair,
  useSearchParams,
} from "react-router";
import {
  SEASON_FROM_SEARCH_PARAM,
  SEASON_TO_SEARCH_PARAM,
  TournamentSeason,
} from "@fbs2.0/types";

import { Page } from "../../components/Page";
import { Header } from "../../components/Header";
import { Season } from "./components/Season";
import { ResponsivePanel } from "../../components/ResponsivePanel";
import { CreateTournament } from "./components/CreateTournament";
import { Winners } from "./components/Winners";
import { EditTournament } from "./components/EditTournament";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { DEFAULT_MIN_SLIDER_VALUE, getSliderMarks } from "./utils";
import { UserContext } from "../../context/userContext";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";

export const DEBOUNCE_TIMEOUT = 500;

let timeout: NodeJS.Timeout;

const Home: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const from = Number(searchParams.get(SEASON_FROM_SEARCH_PARAM));
  const to = Number(searchParams.get(SEASON_TO_SEARCH_PARAM));
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const availableTournaments = useGetTournamentSeasons();

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const [filteredSeasons, setFilteredSeasons] = useState<string[]>([]);
  const [limits, setLimits] = useState<number[]>();
  const [defaultSliderValue, setDefaultSliderValue] = useState<number[]>();
  const [isWinnersOpen, setIsWinnersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [tournamentToEdit, setTournamentToEdit] =
    useState<TournamentSeason | null>(null);

  const { marks, max, min } = useMemo(
    () => getSliderMarks(availableTournaments.data, isMdScreen ? 10 : 20),
    [availableTournaments.data, isMdScreen]
  );

  const onSliderChange = (value: number[]) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      setLimits(value);
    }, DEBOUNCE_TIMEOUT);
  };

  /** Initial values for slider */
  useEffect(() => {
    if (!defaultSliderValue && availableTournaments.isSuccess) {
      const values = [
        Number.isNaN(from) || !from ? DEFAULT_MIN_SLIDER_VALUE : from,
        Number.isNaN(to) || !to ? max : to,
      ];

      setDefaultSliderValue(values);
      setLimits(values);
    }
  }, [availableTournaments.isSuccess, defaultSliderValue, from, max, to]);

  /** Make cards filtration */
  useEffect(() => {
    const [start, end] = [...(limits || [])];

    startTransition(() => {
      setFilteredSeasons(
        Object.keys(availableTournaments.data || {}).filter((season) => {
          const year = Number(season.split("-")[0]);

          return year <= (end || 0) && year >= (start || 0);
        })
      );
    });
  }, [availableTournaments.data, limits]);

  /** Sync with search params */
  useEffect(() => {
    const [start, end] = [...(limits || [])];

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
  }, [from, limits, setSearchParams, to]);

  return (
    <Page title={t("home.title")}>
      <div className={styles.container}>
        <Spin
          fullscreen
          spinning={isPending || availableTournaments.isLoading}
        />
        <Header
          loading={isPending || availableTournaments.isLoading}
          className={styles.header}
        >
          <div className={styles.buttons}>
            {user?.isEditor && (
              <Button
                type="primary"
                size="large"
                title={t("home.create")}
                icon={<PlusOutlined />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                {isMdScreen ? t("home.create") : ""}
              </Button>
            )}
            <Button
              type="default"
              size="large"
              title={t("home.winners")}
              icon={<TrophyOutlined />}
              onClick={() => setIsWinnersOpen(true)}
              disabled={isWinnersOpen}
            />
          </div>
          <div className={styles["slider-holder"]}>
            <div className={styles.slider}>
              {availableTournaments.isSuccess &&
              defaultSliderValue?.[0] &&
              defaultSliderValue?.[1] ? (
                <Slider
                  range={{ draggableTrack: true }}
                  defaultValue={defaultSliderValue}
                  max={max}
                  min={min}
                  marks={marks}
                  onChange={onSliderChange}
                />
              ) : (
                <Skeleton.Input
                  active
                  size="large"
                  block
                  className={styles["slider-skeleton"]}
                />
              )}
            </div>
          </div>
        </Header>
        <div className={styles.body}>
          <div className={styles.timeline}>
            {availableTournaments.isLoading ? (
              <Skeleton active />
            ) : (
              <Timeline
                items={filteredSeasons.map((season) => ({
                  key: season,
                  children: (
                    <Season
                      season={season}
                      tournaments={availableTournaments.data?.[season]}
                      onEdit={setTournamentToEdit}
                      narrow={isWinnersOpen}
                    />
                  ),
                }))}
              />
            )}
            {isCreateDialogOpen && (
              <CreateTournament onClose={() => setIsCreateDialogOpen(false)} />
            )}
            {tournamentToEdit !== null && (
              <EditTournament
                tournamentSeason={tournamentToEdit}
                onClose={() => setTournamentToEdit(null)}
              />
            )}
          </div>
          {availableTournaments.isSuccess && (
            <ResponsivePanel
              isOpen={isWinnersOpen}
              maxWidth={328}
              close={() => setIsWinnersOpen(false)}
            >
              <Winners />
            </ResponsivePanel>
          )}
        </div>
      </div>
    </Page>
  );
};

export { Home };
