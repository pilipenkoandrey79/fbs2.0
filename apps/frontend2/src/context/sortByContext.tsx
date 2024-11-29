import { SortBy } from "@fbs2.0/utils";
import { createContext } from "react";

export type SortByContextValue = {
  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;
};

export const SortByContext = createContext<SortByContextValue>({
  sortBy: SortBy.Total,
  setSortBy: () => null,
});
