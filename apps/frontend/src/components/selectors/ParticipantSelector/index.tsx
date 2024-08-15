import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { Button, MenuItem } from "@blueprintjs/core";
import { Participant } from "@fbs2.0/types";
import { FC, useCallback, useEffect, useState } from "react";

import { Club } from "../../Club";
import { usePrevious } from "../../../hooks/usePrevious";

interface Props {
  participants: Participant[];
  className?: string;
  buttonClassName?: string;
  selectedItemId?: number;
  disabled?: boolean;
  onSelect: (id: number) => void;
}

const PLACEHOLDER = "Оберіть учасника";

const ParticipantSelector: FC<Props> = ({
  participants,
  className,
  buttonClassName,
  selectedItemId,
  disabled = false,
  onSelect,
}) => {
  const [selectedItem, setSelectedItem] = useState<Participant | undefined>(
    () => participants.find(({ id }) => id === selectedItemId)
  );

  const previousSelectedItem = usePrevious(selectedItem);

  const itemRenderer: ItemRenderer<Participant> = (
    item,
    { handleClick, handleFocus, modifiers }
  ) => (
    <MenuItem
      key={item.id}
      text={<Club club={item.club} />}
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
    />
  );

  const itemPredicate: ItemPredicate<Participant> = (
    query,
    item,
    _index,
    exactMatch
  ) => {
    const normalizedTitle = item.club.name.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    return exactMatch
      ? normalizedTitle === normalizedQuery
      : normalizedTitle.indexOf(normalizedQuery) >= 0;
  };

  const onItemSelect = useCallback(
    (item: Participant) => {
      setSelectedItem(item);
      onSelect(item.id);
    },
    [onSelect]
  );

  useEffect(() => {
    if (participants.length === 1) {
      onItemSelect(participants[0]);
    }

    if (
      previousSelectedItem?.id !== selectedItemId &&
      selectedItemId === undefined
    ) {
      setSelectedItem(undefined);
    }
  }, [participants, onItemSelect, previousSelectedItem?.id, selectedItemId]);

  return (
    <Select
      items={participants}
      itemRenderer={itemRenderer}
      itemPredicate={itemPredicate}
      onItemSelect={onItemSelect}
      popoverProps={{ minimal: true }}
      className={className}
      filterable={participants.length >= 20}
    >
      <Button
        text={
          selectedItemId ? (
            <Club
              club={{
                ...participants.find(({ id }) => id === selectedItemId)?.club,
              }}
            />
          ) : selectedItem?.club ? (
            <Club club={selectedItem?.club} />
          ) : (
            PLACEHOLDER
          )
        }
        placeholder={PLACEHOLDER}
        className={buttonClassName}
        disabled={participants.length < 1 || disabled}
      />
    </Select>
  );
};

export { ParticipantSelector };
