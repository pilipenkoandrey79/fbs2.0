import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRendererProps, Select } from "@blueprintjs/select";
import { Tournament } from "@fbs2.0/types";
import { getTournamentTitle, isNotEmpty } from "@fbs2.0/utils";
import { FC, useEffect } from "react";

interface Props {
  selected: Tournament | null;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  year?: string | number;
  excludedItems?: Tournament[];

  onSelect: (item: Tournament | null) => void;
}

type Item = { value: Tournament; label: string };

const TournamentSelector: FC<Props> = ({
  className,
  buttonClassName,
  selected,
  disabled,
  year,
  excludedItems,
  onSelect,
}) => {
  const items = Object.values(Tournament)
    .filter((tournament) => {
      if (excludedItems?.includes(tournament)) {
        return false;
      }

      if (!isNotEmpty(year)) {
        return true;
      }

      switch (tournament) {
        case Tournament.CUP_WINNERS_CUP:
          return Number(year) >= 1960 && Number(year) <= 1998;
        case Tournament.FAIRS_CUP:
          return Number(year) <= 1970;
        case Tournament.EUROPE_LEAGUE:
          return Number(year) >= 1971;
        case Tournament.EUROPE_CONFERENCE_LEAGUE:
          return Number(year) >= 2021;
        default:
          return true;
      }
    })
    .map((tournament) => ({
      value: tournament,
      label: getTournamentTitle(`${year}-`, tournament, false),
    }));

  const onItemSelect = (item: Item) => onSelect(item.value);

  function itemRenderer(
    item: Item,
    { handleClick, handleFocus, modifiers }: ItemRendererProps
  ) {
    return (
      <MenuItem
        key={item.value}
        text={item.label}
        active={modifiers.active}
        disabled={modifiers.disabled}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
      />
    );
  }

  useEffect(() => {
    if (items.length === 0) {
      onSelect(null);
    }
  }, [items.length, onSelect]);

  return (
    <Select
      items={items}
      itemRenderer={itemRenderer}
      onItemSelect={onItemSelect}
      className={className}
      filterable={false}
      disabled={disabled || items.length === 0}
    >
      <Button
        text={
          items.find(({ value }) => value === selected)?.label ||
          "Оберіть тип турніру"
        }
        placeholder="Оберіть тип турніру"
        className={buttonClassName}
        disabled={disabled || items.length === 0}
      />
    </Select>
  );
};

export { TournamentSelector };
