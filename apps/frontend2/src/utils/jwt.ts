import { UIUser } from "@fbs2.0/types";
import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";

interface AccessTokenDecoded {
  exp: number;
  sub: string | number;
  email: string;
}

export const checkToken = (token: string | null) => {
  if (!token) {
    return false;
  }

  const { exp } = jwtDecode<AccessTokenDecoded>(token);
  const expires = DateTime.fromSeconds(exp);

  return expires > DateTime.now();
};

export const getUserEmail = (token: string | null) => {
  if (!token) {
    return "";
  }

  const decodedToken = jwtDecode<AccessTokenDecoded>(token);

  return decodedToken.email;
};

export const getUser = (token: string | null) => {
  const userEmail = getUserEmail(token);

  if (userEmail) {
    return {
      email: userEmail,
      isEditor: userEmail === import.meta.env.VITE_EDITOR_EMAIL,
    } as UIUser;
  }

  return undefined;
};
