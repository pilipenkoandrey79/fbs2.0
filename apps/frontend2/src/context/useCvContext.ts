import { useEffect, useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { CV_SEARCH_PARAMETER } from "@fbs2.0/types";

import { CvContextValue } from "./cvContext";

export const useCvContext = (): CvContextValue => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initValue = searchParams.get(CV_SEARCH_PARAMETER);

  const [cv, setCv] = useState<string | null>(initValue);

  useEffect(() => {
    if (cv !== initValue) {
      setSearchParams(
        createSearchParams(cv === null ? [] : [[CV_SEARCH_PARAMETER, cv]])
      );
    }
  }, [cv, initValue, setSearchParams]);

  return { cvValue: cv, setCvValue: setCv };
};
