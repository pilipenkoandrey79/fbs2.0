import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRendererProps, Select } from "@blueprintjs/select";
import { StageSchemeType } from "@fbs2.0/types";
import { getStageSchemeTypeLabel } from "@fbs2.0/utils";
import { FC } from "react";

interface Props {
  selected: StageSchemeType | null;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;

  onSelect: (item: StageSchemeType) => void;
}

type Item = { value: StageSchemeType; label: string };

const StageSchemeTypeSelector: FC<Props> = ({
  className,
  buttonClassName,
  selected,
  disabled,
  onSelect,
}) => {
  const items = Object.values(StageSchemeType).map((type) => ({
    value: type,
    label: getStageSchemeTypeLabel(type),
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

  return (
    <Select
      items={items}
      itemRenderer={itemRenderer}
      onItemSelect={onItemSelect}
      className={className}
      filterable={false}
    >
      <Button
        text={
          items.find(({ value }) => value === selected)?.label ||
          "Оберіть схему стадії"
        }
        placeholder="Оберіть схему стадії"
        className={buttonClassName}
        disabled={disabled}
      />
    </Select>
  );
};

export { StageSchemeTypeSelector };
