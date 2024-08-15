import { FC, useContext, useMemo, useRef, useState } from "react";
import { Section, SectionCard } from "@blueprintjs/core";
import classNames from "classnames";
import { Club, Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";

import { CreateControls } from "./components/CreateControls";
import { CountryLabel } from "./components/CountryLabel";
import { Combat } from "./components/Combat";
import { CountryTable } from "./components/CountryTable";
import { ClubCV } from "./components/ClubCV";
import { CoefficientHistoryGraph } from "./components/CoefficientHistoryGraph";
import { CountryCV } from "./components/CountryCV";
import { Page } from "../../components/Page";
import { Flag } from "../../components/Flag";
import { LoadOrError } from "../../components/LoadOrError";
import { UserContext } from "../../context/userContext";
import { useGetClubs } from "../../react-query-hooks/club/useGetClubs";
import { useGetClublessCities } from "../../react-query-hooks/city/useGetClublessCities";
import { useGetCountries } from "../../react-query-hooks/country/useGetCountries";
import { prepareTree } from "./prepareTree";

import styles from "./styles.module.scss";

const Clubs: FC = () => {
  const { user } = useContext(UserContext);

  const ref = useRef<HTMLDivElement>(null);

  const [clubCV, setClubCV] = useState<Club | null>(null);
  const [countryCV, setCountryCV] = useState<Country | null>(null);
  const [hidden, setHidden] = useState(false);

  const { data: clubs, isLoading, error } = useGetClubs();

  const {
    data: cities = [],
    isLoading: citiesLoading,
    error: citiesError,
  } = useGetClublessCities();

  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError,
  } = useGetCountries();

  const tree = useMemo(
    () =>
      prepareTree(
        clubs,
        cities,
        countries?.filter(({ till }) => isNotEmpty(till)) || []
      ),
    [cities, clubs, countries]
  );

  return (
    <Page>
      <div className={styles.clubs}>
        <h1 ref={ref}>Клуби, міста, країни</h1>
        {user?.isEditor && <CreateControls />}
        <LoadOrError
          loading={isLoading || citiesLoading || countriesLoading}
          error={error || citiesError || countriesError}
        >
          <div className={styles.container}>
            <div className={classNames(styles.panel, styles.left)}>
              <div className={styles.tree}>
                {tree?.map((country) => (
                  <Section
                    key={country.country.id}
                    collapsible={country.cities.length > 0 && !hidden}
                    compact
                    elevation={1}
                    icon={
                      <Flag country={country.country} className={styles.flag} />
                    }
                    title={
                      <>
                        <CountryLabel
                          country={country.country}
                          onSelect={() => {
                            setCountryCV(country.country);
                            setClubCV(null);
                            ref.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                        />
                        <Combat
                          country={country.country}
                          onChange={(show) => setHidden(show)}
                        />
                      </>
                    }
                    collapseProps={{ defaultIsOpen: false }}
                  >
                    {country.cities.length > 0 && !hidden && (
                      <SectionCard>
                        <CountryTable
                          country={country}
                          onSelect={(club: Club) => {
                            setClubCV(club);
                            setCountryCV(null);
                            ref.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                        />
                      </SectionCard>
                    )}
                  </Section>
                ))}
              </div>
            </div>
            <div className={classNames(styles.panel, styles.right)}>
              {clubCV && <ClubCV club={clubCV} />}
              {countryCV && (
                <div className={styles.graph}>
                  <CoefficientHistoryGraph country={countryCV} />
                </div>
              )}
              {countryCV && <CountryCV country={countryCV} />}
            </div>
          </div>
        </LoadOrError>
      </div>
    </Page>
  );
};

export { Clubs };
