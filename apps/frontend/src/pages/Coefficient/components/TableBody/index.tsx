import { FC } from "react";
import {
  CoefficientData,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  TournamentSeason,
  UKRAINE,
  USSR,
  Winner,
} from "@fbs2.0/types";
import classNames from "classnames";

import { ClubCell } from "../ClubCell";
import { TournamentBadge } from "../../../../components/TournamentBadge";
import { Flag } from "../../../../components/Flag";

import styles from "./styles.module.scss";

interface Props {
  coefficients: CoefficientData[] | undefined;
  season: string | undefined;
  winners: Winner[] | undefined;
  seasons: string[];
}

const TableBody: FC<Props> = ({
  coefficients,
  season = "",
  seasons,
  winners,
}) => (
  <tbody className={styles["coefficient-table-body"]}>
    {coefficients?.map(
      (
        {
          country,
          clubs,
          coefficient: countryCoefficient,
          totalCoefficient,
          seasonCoefficients,
        },
        index
      ) =>
        clubs.length > 0 ? (
          clubs.map(({ club, coefficient, participations }, idx) => (
            <tr
              key={club.id}
              className={classNames({
                [styles.highlighted]: [USSR, UKRAINE].includes(
                  club.city.country.name
                ),
              })}
            >
              {idx === 0 && (
                <>
                  <td rowSpan={clubs.length}>{index + 1}</td>
                  <td rowSpan={clubs.length}>
                    <Flag country={club.city.country} className={styles.flag} />
                    {country.name}
                  </td>
                </>
              )}
              <td>{idx + 1}</td>
              <td className={styles["club-cell"]}>
                <div className={styles.club}>
                  <ClubCell club={club} winners={winners} />
                  <div className={styles.participations}>
                    {participations.map(({ tournament, coefficient }) => (
                      <TournamentBadge
                        key={`${tournament}-${coefficient}`}
                        tournamentSeason={
                          { tournament, season } as TournamentSeason
                        }
                        linkTo={`/tournaments/${season}/${tournament}?${HIGHLIGHTED_CLUB_ID_SEARCH_PARAM}=${club.id}`}
                      />
                    ))}
                  </div>
                </div>
              </td>
              <td>{coefficient}</td>
              {idx === 0 && (
                <td rowSpan={clubs.length} style={{ fontSize: 18 }}>
                  {countryCoefficient.toFixed(3)}
                </td>
              )}
              {idx === 0 &&
                seasons.map((season, index) => {
                  const coefficient = seasonCoefficients.find(
                    (item) => item.season === season
                  )?.coefficient;

                  return (
                    <td
                      rowSpan={clubs.length}
                      key={index}
                      style={{ fontSize: 16 - index * 2 }}
                    >
                      {coefficient?.toFixed(3)}
                    </td>
                  );
                })}
              {idx === 0 && (
                <td rowSpan={clubs.length} style={{ fontSize: 18 }}>
                  {totalCoefficient.toFixed(3)}
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr
            key={`cn-${country.id}`}
            className={classNames({
              [styles.highlighted]: [USSR, UKRAINE].includes(country.name),
            })}
          >
            <td>{index + 1}</td>
            <td>{country.name}</td>
            <td className={styles["club-cell"]}></td>
            <td></td>
            <td></td>
            <td style={{ fontSize: 18 }}>{countryCoefficient.toFixed(3)}</td>
            {seasons.map((season, index) => {
              const coefficient = seasonCoefficients.find(
                (item) => item.season === season
              )?.coefficient;

              return (
                <td key={index} style={{ fontSize: 16 - index * 2 }}>
                  {coefficient?.toFixed(3)}
                </td>
              );
            })}
            {<td style={{ fontSize: 18 }}>{totalCoefficient.toFixed(3)}</td>}
          </tr>
        )
    )}
  </tbody>
);

export { TableBody };
