import { useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { HIGHLIGHTED_CLUB_ID_SEARCH_PARAM } from "@fbs2.0/types";

import { HighlightContextValue } from "./highlightContext";

export const useHighlightContext = (): HighlightContextValue => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [id, setId] = useState<number | null>(() => {
    const initValue = Number(
      searchParams.get(HIGHLIGHTED_CLUB_ID_SEARCH_PARAM)
    );

    return Number.isNaN(initValue) || initValue === 0 ? null : initValue;
  });

  const setHighlightId = (value: number | null) => {
    setId(value);

    setSearchParams(
      value
        ? createSearchParams([[HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${value}`]])
        : {}
    );
  };

  return { highlightId: id, setHighlightId };
};
