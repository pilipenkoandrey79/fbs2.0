import { createContext } from "react";

export type HighlightContextValue = {
  highlightId: number | null;
  setHighlightId: (value: number | null) => void;
};

export const HighlightContext = createContext<HighlightContextValue>({
  highlightId: null,
  setHighlightId: () => null,
});
