import { Button, Label } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { Country } from "@fbs2.0/types";
import { FC, useCallback, useMemo } from "react";
import { isNotEmpty } from "@fbs2.0/utils";

import { itemPredicate, itemRenderer } from "../utils";

interface OldCountriesConfigProp {
  disable?: boolean;
  toTop?: boolean;
}

interface Props {
  countries: Country[];
  className?: string;
  buttonClassName?: string;
  oldCountriesConfig?: OldCountriesConfigProp;
  label?: string;
  disabled?: boolean;

  onSelect: (item: Country) => void;
  selectedCountryId: number | null;
}

const CountrySelector: FC<Props> = ({
  countries,
  className,
  label,
  onSelect,
  selectedCountryId,
  buttonClassName,
  oldCountriesConfig,
  disabled = false,
}) => {
  const items = useMemo(() => {
    if (!oldCountriesConfig?.toTop) {
      return countries;
    }

    const { old, current } = countries.reduce<{
      old: Country[];
      current: Country[];
    }>(
      (acc, country) => {
        if (isNotEmpty(country.till)) {
          acc.old.push(country);
        } else {
          acc.current.push(country);
        }

        return acc;
      },
      { old: [], current: [] }
    );

    return [...old, ...current];
  }, [countries, oldCountriesConfig?.toTop]);

  const itemDisabled = useCallback(
    (item: Country) => {
      if (!oldCountriesConfig?.disable) {
        return false;
      }

      return isNotEmpty(item.till);
    },
    [oldCountriesConfig?.disable]
  );

  return (
    <div className={className}>
      <Label>
        {label}
        <Select
          items={items}
          itemRenderer={itemRenderer}
          onItemSelect={onSelect}
          itemPredicate={itemPredicate}
          filterable={false}
          itemDisabled={itemDisabled}
          disabled={disabled}
        >
          <Button
            text={
              countries.find(({ id }) => id === selectedCountryId)?.name ||
              "Оберіть країну"
            }
            placeholder="Оберіть країну"
            rightIcon="filter"
            className={buttonClassName}
            disabled={disabled}
          />
        </Select>
      </Label>
    </div>
  );
};

export { CountrySelector };
