import { City, _CityDto, Country, _OldCityNameDto } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { FC, useCallback, useState } from "react";
import {
  Button,
  Classes,
  DialogBody,
  DialogFooter,
  Intent,
  Label,
} from "@blueprintjs/core";
import classNames from "classnames";

import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { LoadOrError } from "../../../../../../components/LoadOrError";
import { CityHistory } from "../CityHistory";
import { useGetCountries } from "../../../../../../react-query-hooks/country/useGetCountries";

import styles from "../../../EditForm.module.scss";

interface Props {
  city: City;
  create?: (city: _CityDto) => void;
  update?: (city: City) => void;
  createOldCityName?: (data: _OldCityNameDto) => void;
  deleteOldCityName?: (id: number) => void;
}

const EditCityForm: FC<Props> = ({
  city,
  update,
  create,
  createOldCityName,
  deleteOldCityName,
}) => {
  const { data: countries = [], isLoading, error } = useGetCountries();

  const [name, setName] = useState<string>(() => city.name);
  const [country, setCountry] = useState<Country>(() => city.country);
  const [showOldNameForm, setShowOldNameForm] = useState(false);

  const isSubmitDisabled =
    !country ||
    showOldNameForm ||
    (name === city?.name && country?.id === city?.country?.id);

  const onSubmit = useCallback(() => {
    if (isNotEmpty(city.id) && update) {
      if (isSubmitDisabled) {
        return;
      }

      update({
        name: name || "",
        country: country as Country,
        id: city.id,
      });
    } else {
      if (!country || !create) {
        return;
      }

      create({ name: name || "", countryId: country?.id });
    }
  }, [city.id, country, create, isSubmitDisabled, name, update]);

  return (
    <>
      <DialogBody>
        <div className={styles.controls}>
          <div className={styles.control}>{city.id || "#"}</div>
          <div className={styles.control}>
            <Label>
              Назва
              <input
                className={classNames(Classes.INPUT, styles.name)}
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                disabled={showOldNameForm}
              />
            </Label>
          </div>
          <LoadOrError loading={isLoading} error={error}>
            <CountrySelector
              countries={countries}
              className={classNames(styles.control, styles.country)}
              onSelect={setCountry}
              selectedCountryId={country?.id || null}
              oldCountriesConfig={{
                toTop: isNotEmpty(city.id),
                disable: !isNotEmpty(city.id),
              }}
              label="Належить до країни"
              disabled={showOldNameForm}
            />
          </LoadOrError>
        </div>
        {isNotEmpty(city.id) && createOldCityName && deleteOldCityName && (
          <CityHistory
            city={city}
            showForm={showOldNameForm}
            setShowForm={setShowOldNameForm}
            createOldCityName={createOldCityName}
            deleteOldCityName={deleteOldCityName}
            countries={countries}
          />
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          intent={Intent.PRIMARY}
          text="Зберегти"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
        />
      </DialogFooter>
    </>
  );
};

export { EditCityForm };
