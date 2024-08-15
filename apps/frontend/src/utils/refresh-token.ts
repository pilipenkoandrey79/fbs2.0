import Cookies from "js-cookie";

const COOKIE_KEY = "F23_REFRESH_TOKEN";

const COOKIE_TTL =
  Number(import.meta.env.VITE_JWT_REFRESH_EXPIRATION_TIME) / (24 * 3600);

export const saveRefreshToken = (token: string) =>
  Cookies.set(COOKIE_KEY, token, {
    expires: COOKIE_TTL,
    sameSite: "None",
    secure: true,
  });

export const getRefreshToken = (): string | undefined =>
  Cookies.get(COOKIE_KEY);

export const isRefreshTokenAvailable = () => !!getRefreshToken();
export const removeRefreshToken = () => Cookies.remove(COOKIE_KEY);
