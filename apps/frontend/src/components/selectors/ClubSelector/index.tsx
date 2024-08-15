import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRendererProps, Select } from "@blueprintjs/select";
import { Club as ClubInterface } from "@fbs2.0/types";
import { FC } from "react";

import { Club } from "../../Club";

import { itemPredicate } from "../utils";

interface Props {
  clubs: ClubInterface[];
  className?: string;
  buttonClassName?: string;
  selectedClubId: number | null;
  selectedCountryId?: number;
  filterable?: boolean;

  onSelect: (item: ClubInterface) => void;
}

const itemRenderer = (
  item: ClubInterface,
  { handleClick, handleFocus, modifiers }: ItemRendererProps
) => (
  <MenuItem
    key={item.id}
    text={<Club club={item} />}
    active={modifiers.active}
    disabled={modifiers.disabled}
    onClick={handleClick}
    onFocus={handleFocus}
    roleStructure="listoption"
  />
);

const ClubSelector: FC<Props> = ({
  clubs,
  className,
  buttonClassName,
  selectedClubId,
  selectedCountryId,
  filterable = false,
  onSelect,
}) => {
  const items = !selectedCountryId
    ? clubs
    : clubs.filter(({ city }) => city?.country?.id === selectedCountryId);

  return (
    <Select
      items={items}
      itemRenderer={itemRenderer}
      onItemSelect={onSelect}
      itemPredicate={itemPredicate}
      className={className}
      filterable={filterable}
    >
      <Button
        text={
          items.find(({ id }) => id === selectedClubId)?.name || "Оберіть клуб"
        }
        placeholder="Оберіть клуб"
        className={buttonClassName}
        disabled={items.length < 1}
      />
    </Select>
  );
};

export { ClubSelector };
