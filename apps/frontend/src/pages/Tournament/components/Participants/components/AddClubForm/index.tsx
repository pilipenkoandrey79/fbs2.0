import { Button, Classes } from "@blueprintjs/core";
import { FC, useState } from "react";
import { City, Country } from "@fbs2.0/types";

import { CitySelector } from "../../../../../../components/selectors/CitySelector";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { useGetCities } from "../../../../../../react-query-hooks/city/useGetCities";
import { useCreateClub } from "../../../../../../react-query-hooks/club/useCreateClub";

import styles from "./styles.module.scss";

interface Props {
  countries: Country[];
}

const AddClubForm: FC<Props> = ({ countries }) => {
  const { data: cities = [] } = useGetCities();

  const { mutate: createClub } = useCreateClub(() => {
    setClubName(null);
    setSelectedCountryId(null);
    setCityId(null);
  });

  const [clubName, setClubName] = useState<string | null>(null);

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );

  const [cityId, setCityId] = useState<number | null>(null);

  const citiesItems = cities.filter(
    ({ country }) => country.id === selectedCountryId
  );

  const add = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();

    if (cityId === null || clubName === null) {
      return;
    }

    createClub({ name: clubName, cityId });
  };

  const onCountrySelect = ({ id }: Country) => {
    setSelectedCountryId(id);
    setCityId(null);
  };

  return (
    <div className={styles["add-participant"]}>
      <div className={styles.control}>
        <input
          type="text"
          className={Classes.INPUT}
          value={clubName ?? ""}
          placeholder="Клуб"
          maxLength={120}
          onChange={(e) => setClubName(e.target.value)}
        />
      </div>
      <CountrySelector
        countries={countries}
        onSelect={onCountrySelect}
        selectedCountryId={selectedCountryId}
        className={styles.control}
        oldCountriesConfig={{ disable: true }}
      />
      <CitySelector
        cities={citiesItems}
        onSelect={({ id }: City) => setCityId(id)}
        selectedCityId={cityId}
        selectedCountryId={selectedCountryId}
        className={styles.control}
      />
      <Button
        text="Додати"
        intent="primary"
        onClick={add}
        className={styles.button}
        disabled={!clubName || !cityId}
      />
    </div>
  );
};

export { AddClubForm };
