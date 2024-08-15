import { Country, CountryCVStatus } from "@fbs2.0/types";
import { FC } from "react";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { howMany } from "@fbs2.0/utils";

import { LoadOrError } from "../../../../components/LoadOrError";
import { TournamentBadge } from "../../../../components/TournamentBadge";
import CountryCVRowDescription from "./components/CountryCVRowDescription";
import { useCountryCV } from "../../../../react-query-hooks/country/useCountryCV";

import styles from "./styles.module.scss";

interface Props {
  country: Country;
}

const CountryCV: FC<Props> = ({ country }) => {
  const { data: cv, error, isLoading } = useCountryCV(country.id);

  const cups =
    cv?.filter(({ status }) =>
      [CountryCVStatus.Both, CountryCVStatus.Winner].includes(status)
    ).length || 0;

  return (
    <LoadOrError loading={isLoading} error={error}>
      <div className={styles.header}>
        <h2>
          {country.name}
          {(cv?.length || 0) > 0
            ? `: ${howMany(cv?.length || 0, "фінал")}${
                cups > 0 ? `, ${howMany(cups, "титул")}` : ""
              }`
            : ""}
        </h2>
      </div>
      {(cv?.length || 0) > 0 && (
        <div className={styles.cv}>
          <table
            className={classNames(
              Classes.HTML_TABLE,
              Classes.COMPACT,
              Classes.HTML_TABLE_BORDERED,
              Classes.HTML_TABLE_STRIPED
            )}
          >
            <thead>
              <tr>
                <th>Сезон</th>
                <th>Турнір</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cv?.map((row) => {
                const { tournamentSeason, status } = row;

                return (
                  <tr
                    key={tournamentSeason.id}
                    className={classNames({
                      [styles.winner]:
                        status === CountryCVStatus.Winner ||
                        status === CountryCVStatus.Both,
                    })}
                  >
                    <td>{tournamentSeason.season}</td>
                    <td>
                      <TournamentBadge tournamentSeason={tournamentSeason} />
                    </td>

                    <CountryCVRowDescription row={row} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </LoadOrError>
  );
};

export { CountryCV };
