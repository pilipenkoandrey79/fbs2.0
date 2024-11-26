import { createContext } from "react";

export type CvContextValue = {
  cvValue: string | null;
  setCvValue: (value: string | null) => void;
};

export const CvContext = createContext<CvContextValue>({
  cvValue: null,
  setCvValue: () => null,
});
