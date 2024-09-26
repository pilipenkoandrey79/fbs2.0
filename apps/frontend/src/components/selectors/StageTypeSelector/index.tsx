import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRendererProps, Select } from "@blueprintjs/select";
import { Stage, StageType } from "@fbs2.0/types";
import { _getStageLabel } from "@fbs2.0/utils";
import { FC, useCallback, useEffect } from "react";

interface Props {
  stages: Stage[];
  selectedStageType: StageType | null;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;

  onSelect: (item: StageType) => void;
}

type Item = { value: StageType; label: string };

const PLACEHOLDER = "Оберіть стадію старту";

const StageTypeSelector: FC<Props> = ({
  className,
  buttonClassName,
  selectedStageType,
  stages,
  disabled = false,
  onSelect,
}) => {
  const items = stages.map(({ stageType }) => ({
    value: stageType as StageType,
    label: _getStageLabel(stageType as StageType),
  }));

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

  const onItemSelect = useCallback(
    (item: Item) => onSelect(item.value),
    [onSelect]
  );

  useEffect(() => {
    if (items.length === 1) {
      onItemSelect(items[0]);
    }
  }, [items, onItemSelect]);

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
          items.find(({ value }) => value === selectedStageType)?.label ||
          PLACEHOLDER
        }
        placeholder={PLACEHOLDER}
        className={buttonClassName}
        disabled={disabled}
      />
    </Select>
  );
};

export { StageTypeSelector };
