import { createContext } from "react";

export type CVInput = { type: "club" | "country"; id: number | undefined };

export type CvContextValue = {
  cvInput: CVInput | null;
  isPending: boolean;
  setCvInput: (value: CVInput | null) => void;
};

export const CvContext = createContext<CvContextValue>({
  cvInput: null,
  isPending: false,
  setCvInput: () => null,
});
