import { useState } from "react";
import { SortBy } from "@fbs2.0/utils";

import { SortByContextValue } from "./sortByContext";

export const useSortByContext = (): SortByContextValue => {
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Total);

  return { sortBy, setSortBy };
};
