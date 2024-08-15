import { FC, useContext, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  SortBy,
  getSeasonsForCoefficientcalculation,
  getTournamentTitle,
  handleStringChange,
  sortCoefficientData,
} from "@fbs2.0/utils";
import classNames from "classnames";
import {
  Button,
  Classes,
  Icon,
  Intent,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";

import { Page } from "../../components/Page";
import { LoadOrError } from "../../components/LoadOrError";
import { useGetTournamentSeasons } from "../../react-query-hooks/tournament/useGetTournamentSeasons";
import { TableBody } from "./components/TableBody";
import { useGetCoefficientData } from "../../react-query-hooks/coefficient/useGetCoefficientData";
import { UserContext } from "../../context/userContext";
import { useCalculateCoefficient } from "../../react-query-hooks/coefficient/useCalculateCoefficient";
import { useGetWinners } from "../../react-query-hooks/coefficient/useGetWinners";

import styles from "./styles.module.scss";

const Coefficient: FC = () => {
  const { season } = useParams();

  const { user } = useContext(UserContext);

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Total);

  const { data: availableTournaments } = useGetTournamentSeasons();
  const { data: winners } = useGetWinners(season || "");
  const { data, isLoading, error } = useGetCoefficientData(season || "");
  const { mutate: calculateCoefficients, isLoading: calculateInProgress } =
    useCalculateCoefficient();

  const seasons = getSeasonsForCoefficientcalculation(season);

  const navLinks = useMemo(() => {
    if (!season) {
      return undefined;
    }

    return availableTournaments?.[season]?.map(({ type }) => ({
      to: `/tournaments/${season}/${type}`,
      label: getTournamentTitle(season, type, true, true),
    }));
  }, [availableTournaments, season]);

  const coefficients = useMemo(
    () => sortCoefficientData(data, sortBy),
    [data, sortBy]
  );

  const { previousLink, nextLink } = useMemo(() => {
    const [start, finish] = (season || "").split("-").map((v) => Number(v));
    const prevSeason = `${start - 1}-${finish - 1}`;
    const nextSeason = `${start + 1}-${finish + 1}`;
    const hasPrevSeason = (availableTournaments?.[prevSeason]?.length || 0) > 0;
    const hasNextSeason = (availableTournaments?.[nextSeason]?.length || 0) > 0;

    const previousLink = hasPrevSeason
      ? `/coefficient/${prevSeason}`
      : undefined;

    const nextLink = hasNextSeason ? `/coefficient/${nextSeason}` : undefined;

    return { previousLink, nextLink };
  }, [availableTournaments, season]);

  return (
    <Page navLinks={navLinks}>
      <div className={styles.coefficient}>
        <div className={styles["coefficient-header"]}>
          <div className={styles["coefficient-header-title"]}>
            {previousLink && (
              <a
                href={previousLink}
                className={classNames(
                  Classes.TEXT_LARGE,
                  styles["coefficient-header-title-link"]
                )}
              >
                <Icon icon="arrow-left" />
                Попередній сезон
              </a>
            )}
            <h1>Коеффіцієнти УЄФА для сезону {season}</h1>
            {nextLink && (
              <a
                href={nextLink}
                className={classNames(
                  Classes.TEXT_LARGE,
                  styles["coefficient-header-title-link"]
                )}
              >
                Наступний сезон
                <Icon icon="arrow-right" />
              </a>
            )}
          </div>
          {user?.isEditor && (
            <Button
              text="Розрахувати (оновити) коефіцієнти"
              intent={Intent.PRIMARY}
              onClick={() => calculateCoefficients(season || "")}
              disabled={calculateInProgress}
            />
          )}
        </div>
        <LoadOrError loading={isLoading} error={error}>
          <RadioGroup
            label="Сортувати за: "
            onChange={handleStringChange((value) => setSortBy(value as SortBy))}
            selectedValue={sortBy}
            className={styles.sort}
          >
            <Radio label="Країна" value={SortBy.Country} />
            <Radio label="Коефіцієнт поточного сезону" value={SortBy.Current} />
            <Radio label="Сумарний коефіцієнт" value={SortBy.Total} />
          </RadioGroup>
          <table className={classNames(Classes.HTML_TABLE, Classes.COMPACT)}>
            <thead>
              <tr>
                <th></th>
                <th>Країна</th>
                <th colSpan={2}>Клуб</th>
                <th>Клубний коеффіцієнт</th>
                {seasons.map(({ label }) => (
                  <th key={label}>Коеффіцієнт {label}</th>
                ))}
                <th>Сумма</th>
              </tr>
            </thead>
            <TableBody
              coefficients={coefficients}
              season={season}
              winners={winners}
              seasons={seasons
                .filter(({ label }) => label !== season)
                .map(({ label }) => label)}
            />
          </table>
        </LoadOrError>
      </div>
    </Page>
  );
};

export { Coefficient };
