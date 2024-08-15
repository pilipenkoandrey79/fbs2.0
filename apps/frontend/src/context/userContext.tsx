import { UIUser } from "@fbs2.0/types";
import { createContext } from "react";

export type UserContextValue = {
  user: UIUser | undefined;
  setUser: React.Dispatch<React.SetStateAction<UIUser | undefined>>;
};

export const UserContext = createContext<UserContextValue>({
  user: undefined,
  setUser: () => undefined,
});
