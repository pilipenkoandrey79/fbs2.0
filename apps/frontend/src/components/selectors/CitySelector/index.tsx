import { Suggest } from "@blueprintjs/select";
import { City, Country } from "@fbs2.0/types";
import { FC, useEffect, useState } from "react";
import { isNotEmpty } from "@fbs2.0/utils";
import { Icon, Label } from "@blueprintjs/core";
import classNames from "classnames";

import { itemPredicate, itemRenderer } from "../utils";
import { useCreateCity } from "../../../react-query-hooks/city/useCreateCity";

import styles from "./styles.module.scss";

interface Props {
  cities: City[];
  className?: string;
  selectedCountryId: number | null;
  selectedCityId: number | null;
  allowCreateNew?: boolean;
  label?: string;
  disabled?: boolean;

  onSelect: (item: City) => void;
}

const CitySelector: FC<Props> = ({
  cities,
  className,
  selectedCityId,
  selectedCountryId,
  allowCreateNew = true,
  label,
  disabled,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [showTick, setShowTick] = useState(false);

  const { mutate: createCity, isPending } = useCreateCity((city) => {
    if (city !== null) {
      onSelect(city);
      setShowTick(true);
    }
  });

  const inputValueRenderer = (_item: City) =>
    cities.find(({ id }) => selectedCityId === id)?.name || "";

  const createNewItemFromQuery = (query: string): City =>
    isNotEmpty(selectedCountryId)
      ? {
          id: 0,
          name: query,
          country: { id: selectedCountryId as number } as Country,
        }
      : ({} as City);

  const onItemSelect = (item: City) => {
    if (cities.includes(item)) {
      onSelect(item);
      setShowTick(true);
    } else {
      if (!allowCreateNew || !item || !item.country) {
        return;
      }

      createCity({ name: item.name, countryId: item.country.id });
    }
  };

  useEffect(() => {
    if (isNotEmpty(selectedCityId)) {
      setQuery(cities.find(({ id }) => selectedCityId === id)?.name || "");
      setShowTick(true);
    } else {
      setQuery("");
      setShowTick(false);
    }
  }, [cities, selectedCityId, selectedCountryId]);

  return (
    <div className={classNames(className, styles["city-selector"])}>
      <Label>
        {label}
        <Suggest
          items={cities}
          query={query}
          itemRenderer={itemRenderer}
          onItemSelect={onItemSelect}
          itemPredicate={itemPredicate}
          onQueryChange={(q) => {
            setQuery(q);
          }}
          inputValueRenderer={inputValueRenderer}
          createNewItemFromQuery={
            allowCreateNew ? createNewItemFromQuery : undefined
          }
          popoverProps={{ minimal: true }}
          disabled={disabled || isPending}
        />
      </Label>
      {showTick && <Icon icon="small-tick" className={styles.tick} />}
    </div>
  );
};

export { CitySelector };
