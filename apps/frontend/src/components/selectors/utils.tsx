import { MenuItem } from "@blueprintjs/core";
import { ItemRendererProps } from "@blueprintjs/select";

export function itemRenderer<T extends { id: number; name: string }>(
  item: T,
  { handleClick, handleFocus, modifiers }: ItemRendererProps
) {
  return (
    <MenuItem
      key={item.id}
      text={item.name}
      active={modifiers.active}
      disabled={modifiers.disabled}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
    />
  );
}

export function itemPredicate<T extends { id: number; name: string }>(
  query: string,
  item: T,
  _index?: number,
  exactMatch?: boolean
) {
  const normalizedTitle = item.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  return exactMatch
    ? normalizedTitle === normalizedQuery
    : normalizedTitle.indexOf(normalizedQuery) >= 0;
}
