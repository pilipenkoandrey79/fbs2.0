import { FC, useCallback, useState } from "react";
import { Button, Classes, Intent, Label } from "@blueprintjs/core";
import { City, Country, OldCityNameDto } from "@fbs2.0/types";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";

import { NumberInput } from "../../../../../../components/NumberInput";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";

import styles from "../../../EditForm.module.scss";

interface Props {
  city: City;
  countries: Country[];
  showForm: boolean;
  setShowForm: (is: boolean) => void;
  createOldCityName: (data: OldCityNameDto) => void;
  deleteOldCityName: (id: number) => void;
}

const CityHistory: FC<Props> = ({
  city,
  countries,
  showForm,
  setShowForm,
  createOldCityName,
  deleteOldCityName,
}) => {
  const [name, setName] = useState<string>();
  const [till, setTill] = useState<number>();
  const [countryId, setCountryId] = useState<number | undefined>();

  const isSubmitDisabled =
    (countryId === city.country.id && !isNotEmpty(name)) || !isNotEmpty(till);

  const addOldNameItem = useCallback(() => {
    if (isNotEmpty(till) && isNotEmpty(countryId)) {
      if (isSubmitDisabled) {
        return;
      }

      createOldCityName({
        till: `${till}`,
        name,
        countryId,
        cityId: city.id,
      });
    }
  }, [city.id, countryId, createOldCityName, isSubmitDisabled, name, till]);

  const onRemoveOldNameItem = useCallback(
    (id: number) => {
      if (isNotEmpty(id)) {
        deleteOldCityName(id);
      }
    },
    [deleteOldCityName]
  );

  return (
    <div className={styles.history}>
      <div className={styles["history-header"]}>
        <h4>Історія назв</h4>
        <Button
          icon="plus"
          small
          intent={Intent.PRIMARY}
          onClick={() => {
            setShowForm(true);
            setCountryId(city.country.id);
          }}
          disabled={showForm}
        />
      </div>
      <ol>
        {[...(city.oldNames || [])]
          .sort((a, b) => Number(a.till) - Number(b.till))
          .map(({ id, name, country, till }) => (
            <li key={id}>
              <div className={styles["history-item"]}>
                <div className={styles["history-item-value"]}>
                  <b>До:</b>
                  <span>{till}</span>
                </div>
                <div className={styles["history-item-value"]}>
                  <b>Назва:</b>
                  <span>{name}</span>
                </div>
                <div className={styles["history-item-value"]}>
                  <b>Країна:</b>
                  <span>{country?.name}</span>
                </div>
                <Button
                  icon="trash"
                  intent={Intent.DANGER}
                  small
                  minimal
                  onClick={() => onRemoveOldNameItem(id)}
                  disabled={showForm}
                />
              </div>
            </li>
          ))}
      </ol>
      {showForm && (
        <>
          <div className={styles.controls}>
            <Button
              intent={Intent.NONE}
              icon="cross"
              minimal
              small
              onClick={() => {
                setShowForm(false);
                setTill(undefined);
                setName(undefined);
              }}
              className={styles["old-name-close-button"]}
            />
            <NumberInput
              value={till}
              setValue={setTill}
              label="До"
              className={styles.control}
            />
            <div className={styles.control}>
              <Label>
                Назва
                <input
                  className={classNames(Classes.INPUT, styles.name)}
                  value={name || ""}
                  onChange={(e) => setName(e.target.value)}
                />
              </Label>
            </div>
            <CountrySelector
              countries={countries}
              className={classNames(styles.control, styles.country)}
              onSelect={({ id }) => setCountryId(id)}
              selectedCountryId={countryId || null}
              oldCountriesConfig={{
                toTop: true,
              }}
              label="Належить до країни"
            />
          </div>
          <Button
            intent={Intent.PRIMARY}
            text="Зберегти"
            onClick={addOldNameItem}
            disabled={isSubmitDisabled}
          />
        </>
      )}
    </div>
  );
};

export { CityHistory };
