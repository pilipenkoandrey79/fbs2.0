import { FC, useMemo } from "react";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";
import {
  getResultLabel,
  _getStageLabel,
  _getTournamentTitle,
  prepareClub,
} from "@fbs2.0/utils";
import { Link } from "react-router";
import { Country, Club as ClubInterface } from "@fbs2.0/types";

import { useGetCombatMatches } from "../../../../../../react-query-hooks/matches/useGetCombatMatches";
import { LoadOrError } from "../../../../../../components/LoadOrError";
import { Club } from "../../../../../../components/Club";
import { Balance } from "../../../../../../components/Balance";

import styles from "./styles.module.scss";

interface Props {
  country: Country;
  rival: Country;
}

const CombatMatches: FC<Props> = ({ country, rival }) => {
  const { data, isLoading, error } = useGetCombatMatches(country.id, rival.id);

  const matches =
    (data?.balance.w || 0) +
    (data?.balance.d || 0) +
    (data?.balance.l || 0) +
    (data?.balance.u || 0);

  const clubs = useMemo(
    () =>
      data?.rows.reduce<{ c: ClubInterface[]; r: ClubInterface[] }>(
        (acc, { stages }) => {
          stages.forEach(({ matches }) =>
            matches.forEach(({ host, guest }) => {
              [host, guest].forEach((participant) => {
                if (participant.club.city.country.id === country.id) {
                  if (!acc.c.find(({ id }) => id === participant.club.id)) {
                    acc.c.push(participant.club);
                  }
                } else {
                  if (!acc.r.find(({ id }) => id === participant.club.id)) {
                    acc.r.push(participant.club);
                  }
                }
              });
            })
          );

          return acc;
        },
        { c: [], r: [] }
      ),
    [country.id, data?.rows]
  );

  return (
    <LoadOrError loading={isLoading} error={error}>
      <div className={styles.balance}>
        <p>
          Всього матчів: <span className={styles.value}>{matches}</span>
        </p>
        {matches > 0 && (
          <p>
            Баланс: <Balance balance={data?.balance} />
          </p>
        )}
      </div>
      <div>
        Клуби
        <table className={classNames(Classes.HTML_TABLE, Classes.COMPACT)}>
          <tbody>
            <tr>
              <td>{`${country.name} (${clubs?.c.length})`}</td>
              <td>
                {clubs?.c.map((club, index, ar) => (
                  <>
                    <Club key={club.id} club={club} showCountry={false} />
                    {index < ar.length - 1 && ", "}
                  </>
                ))}
              </td>
            </tr>
            <tr>
              <td>{`${rival.name} (${clubs?.r.length})`}</td>
              <td>
                {clubs?.r.map((club, index, ar) => (
                  <>
                    <Club key={club.id} club={club} showCountry={false} />
                    {index < ar.length - 1 && ", "}
                  </>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <table className={classNames(Classes.HTML_TABLE, Classes.COMPACT)}>
          <colgroup>
            <col style={{ width: 280 }} />
          </colgroup>
          <tbody>
            {data?.rows.map(({ tournamentSeason, stages }) => {
              const year = tournamentSeason.season.split("-")[0];

              return (
                <tr key={tournamentSeason.id}>
                  <td>
                    <Link
                      to={`/tournaments/${tournamentSeason.season}/${tournamentSeason.tournament}`}
                    >
                      {_getTournamentTitle(
                        tournamentSeason.season,
                        tournamentSeason.tournament,
                        true,
                        false
                      )}
                    </Link>
                  </td>
                  <td>
                    <table
                      className={classNames(
                        Classes.HTML_TABLE,
                        Classes.COMPACT
                      )}
                    >
                      <colgroup>
                        <col style={{ width: 200 }} />
                      </colgroup>
                      <tbody>
                        {stages.map(({ stage, matches }) => (
                          <tr key={stage.id}>
                            <td>{_getStageLabel(stage.stageType)}</td>
                            <td>
                              <table
                                className={classNames(
                                  Classes.HTML_TABLE,
                                  Classes.COMPACT
                                )}
                              >
                                <colgroup>
                                  <col style={{ width: 150 }} />
                                  <col style={{ width: 400 }} />
                                </colgroup>
                                <thead>
                                  <tr>
                                    <th>Дата</th>
                                    <th>Матч</th>
                                    <th>Результат</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {matches.map(
                                    ({
                                      id,
                                      date,
                                      host,
                                      guest,
                                      hostScore,
                                      guestScore,
                                      replayDate,
                                      unplayed,
                                      tech,
                                    }) => (
                                      <tr key={id}>
                                        <td>{date}</td>
                                        <td>
                                          <Club
                                            club={prepareClub(host.club, year)}
                                            showCountry={false}
                                          />
                                          {" - "}
                                          <Club
                                            club={prepareClub(guest.club, year)}
                                            showCountry={false}
                                          />
                                        </td>
                                        <td>
                                          {getResultLabel(
                                            { hostScore, guestScore },
                                            {
                                              answer: false,
                                              afterMatchPenalties: false,
                                              replayDate,
                                              unplayed: unplayed ?? false,
                                              tech: tech ?? false,
                                            }
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </LoadOrError>
  );
};

export { CombatMatches };
