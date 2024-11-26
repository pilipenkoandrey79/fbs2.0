import { FC } from "react";

import { CvContext } from "../../../../context/cvContext";
import { useCvContext } from "../../../../context/useCvContext";
import { Country } from "./components/Country";

export type CVInput = { type: "club" | "country"; id: number | undefined };

const CountryWrapper: FC = () => {
  const cvValueState = useCvContext();

  return (
    <CvContext.Provider value={cvValueState}>
      <Country />
    </CvContext.Provider>
  );
};

export { CountryWrapper };
