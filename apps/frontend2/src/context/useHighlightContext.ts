import { useEffect, useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { HIGHLIGHTED_CLUB_ID_SEARCH_PARAM } from "@fbs2.0/types";

import { HighlightContextValue } from "./highlightContext";

export const useHighlightContext = (): HighlightContextValue => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initValue = Number(searchParams.get(HIGHLIGHTED_CLUB_ID_SEARCH_PARAM));

  const [id, setId] = useState<number | null>(() =>
    Number.isNaN(initValue) ? null : initValue
  );

  useEffect(() => {
    if (Number.isNaN(initValue) || id !== initValue) {
      setSearchParams(
        createSearchParams(
          id === null ? [] : [[HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${id}`]]
        )
      );
    }
  }, [id, initValue, searchParams, setSearchParams]);

  return { highlightId: id, setHighlightId: setId };
};
