import { UIUser } from "@fbs2.0/types";
import { useState } from "react";

import { UserContextValue } from "./userContext";
import { getRefreshToken } from "../utils/refresh-token";
import { getApiToken, removeApiToken } from "../utils/api-token";
import { getUser } from "../utils/jwt";

export const useUserContext = (): UserContextValue => {
  const [user, setUser] = useState<UIUser | undefined>(() => {
    if (!getRefreshToken()) {
      removeApiToken();

      return undefined;
    }

    return getUser(getApiToken());
  });

  return { user, setUser };
};
