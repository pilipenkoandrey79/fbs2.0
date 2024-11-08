import { City, Club, _ClubDto, _OldClubNameDto } from "@fbs2.0/types";
import { FC, useCallback, useState } from "react";
import { isNotEmpty } from "@fbs2.0/utils";
import {
  Button,
  Classes,
  DialogBody,
  DialogFooter,
  Intent,
  Label,
} from "@blueprintjs/core";
import classNames from "classnames";

import { LoadOrError } from "../../../../../../components/LoadOrError";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { CitySelector } from "../../../../../../components/selectors/CitySelector";
import { ClubHistory } from "../ClubHistory";
import { useGetCountries } from "../../../../../../react-query-hooks/country/useGetCountries";
import { useGetCities } from "../../../../../../react-query-hooks/city/useGetCities";

import styles from "../../../EditForm.module.scss";

interface Props {
  club: Club;
  create?: (city: _ClubDto) => void;
  update?: (city: Club) => void;
  createOldClubName?: (data: _OldClubNameDto) => void;
  deleteOldClubName?: (id: number) => void;
}

const EditClubForm: FC<Props> = ({
  club,
  create,
  update,
  createOldClubName,
  deleteOldClubName,
}) => {
  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError,
  } = useGetCountries();

  const {
    data: cities = [],
    isLoading: citiesLoading,
    error: citiesError,
  } = useGetCities();

  const [name, setName] = useState<string>(() => club?.name);
  const [city, setCity] = useState<City>(() => club?.city);

  const [countryId, setCountryId] = useState<number>(
    () => club?.city?.country?.id
  );

  const [showOldNameForm, setShowOldNameForm] = useState(false);

  const citiesItems = cities.filter(({ country }) => country.id === countryId);

  const isSubmitDisabled =
    !isNotEmpty(city?.id) ||
    showOldNameForm ||
    (name === club.name &&
      countryId === club?.city?.country?.id &&
      city?.id === club?.city?.id);

  const onSubmit = useCallback(() => {
    if (isNotEmpty(club.id) && update) {
      if (isSubmitDisabled) {
        return;
      }

      update({
        name: name || "",
        city: city as City,
        id: club.id,
      });
    } else {
      if (!city || !create) {
        return;
      }

      create({ name: name || "", cityId: city?.id });
    }
  }, [city, club.id, create, isSubmitDisabled, name, update]);

  return (
    <>
      <DialogBody>
        <div className={styles.controls}>
          <div className={styles.control}>{club.id || "#"}</div>
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
          <LoadOrError loading={countriesLoading} error={countriesError}>
            <CountrySelector
              countries={countries}
              className={classNames(styles.control, styles.country)}
              onSelect={(country) => setCountryId(country.id)}
              selectedCountryId={countryId || null}
              oldCountriesConfig={{
                disable: true,
              }}
              label="Належить до країни"
              disabled={showOldNameForm}
            />
          </LoadOrError>
          <LoadOrError loading={citiesLoading} error={citiesError}>
            <CitySelector
              cities={citiesItems}
              onSelect={setCity}
              selectedCityId={city?.id ?? null}
              selectedCountryId={countryId ?? null}
              className={classNames(styles.control, styles.city)}
              allowCreateNew={false}
              label="Місто"
              disabled={showOldNameForm}
            />
          </LoadOrError>
        </div>
        {isNotEmpty(club.id) && createOldClubName && deleteOldClubName && (
          <ClubHistory
            club={club}
            showForm={showOldNameForm}
            setShowForm={setShowOldNameForm}
            createOldClubName={createOldClubName}
            deleteOldClubName={deleteOldClubName}
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

export { EditClubForm };
