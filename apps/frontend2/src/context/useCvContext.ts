import { useEffect, useState, useTransition } from "react";
import { createSearchParams, useSearchParams } from "react-router";
import { CV_SEARCH_PARAMETER } from "@fbs2.0/types";

import { CvContextValue, CVInput } from "./cvContext";

export const useCvContext = (countryId: number): CvContextValue => {
  const [isPending, startTransition] = useTransition();
  const [searchParams, setSearchParams] = useSearchParams();
  const initValue = searchParams.get(CV_SEARCH_PARAMETER);

  const [cvInput, setCvInputInternal] = useState<CVInput | null>(() => {
    if (initValue?.match(/(country|club)(-(\d+))?/)) {
      const cvSearchParameterParts = initValue.split("-");
      const type = cvSearchParameterParts[0] as CVInput["type"];

      const id =
        type === "country" ? countryId : Number(cvSearchParameterParts[1]);

      return { type, id };
    }

    return null;
  });

  useEffect(() => {
    const newCvSearchParameter = cvInput
      ? `${cvInput.type}${cvInput.type === "club" ? `-${cvInput.id}` : ""}`
      : null;

    if (newCvSearchParameter !== initValue) {
      setSearchParams(
        createSearchParams(
          newCvSearchParameter === null
            ? []
            : [[CV_SEARCH_PARAMETER, newCvSearchParameter]]
        )
      );
    }
  }, [cvInput, initValue, setSearchParams]);

  const setCvInput = (value: CVInput | null) =>
    startTransition(() => {
      setCvInputInternal(value);
    });

  return { cvInput, setCvInput, isPending };
};
