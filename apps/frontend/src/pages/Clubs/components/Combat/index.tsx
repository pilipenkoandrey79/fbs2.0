import { Button, Classes, Drawer, DrawerSize } from "@blueprintjs/core";
import { Country } from "@fbs2.0/types";
import { FC, useState } from "react";

import { CountrySelector } from "../../../../components/selectors/CountrySelector";
import { LoadOrError } from "../../../../components/LoadOrError";
import { CombatMatches } from "./components/CombatMatches";
import { Flag } from "../../../../components/Flag";
import { useGetCountries } from "../../../../react-query-hooks/country/useGetCountries";

import styles from "./styles.module.scss";

interface Props {
  country: Country;

  onChange: (show: boolean) => void;
}

const Combat: FC<Props> = ({ country, onChange }) => {
  const countries = useGetCountries();

  const [isOpen, setIsOpen] = useState(false);
  const [rival, setRival] = useState<Country | null>(null);

  return (
    <>
      <Button
        text="Список матчів з іншою країною"
        minimal
        onClick={() => {
          setIsOpen(true);
          onChange(true);
        }}
      />
      <Drawer
        onClose={() => {
          setIsOpen(false);
          setRival(null);
          onChange(false);
        }}
        isOpen={isOpen}
        icon="info-sign"
        title={
          <>
            <span className={styles.country}>
              <Flag country={country} className={styles.flag} />
              <span>{country.name}</span>
            </span>
            {!!rival?.id && (
              <span className={styles.country}>
                <Flag country={rival} className={styles.flag} />
                <span>{rival.name}</span>
              </span>
            )}
          </>
        }
        autoFocus
        hasBackdrop
        canOutsideClickClose={false}
        usePortal
        size={DrawerSize.LARGE}
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <LoadOrError loading={countries.isLoading} error={countries.error}>
              <div className={styles.rival}>
                <span className={styles.label}>Країна-суперник:</span>
                <CountrySelector
                  countries={
                    countries.data?.filter(({ id }) => id !== country.id) || []
                  }
                  onSelect={setRival}
                  selectedCountryId={rival?.id ?? null}
                />
                <Button
                  icon="cross"
                  onClick={() => setRival(null)}
                  disabled={!rival?.id}
                />
              </div>
            </LoadOrError>
            {!!rival?.id && !!country.id && (
              <CombatMatches country={country} rival={rival} />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export { Combat };
