import { AUTH_REDIRECT_PATH } from "@fbs2.0/types";

import { Clubs } from "./pages/Clubs";
import { Coefficient } from "./pages/Coefficient";
import { Home } from "./pages/Home";
import { Tournament } from "./pages/Tournament";
import { AuthSuccessRedirect } from "./components/AuthSuccessRedirect";

export enum Paths {
  HOME = "/",
  TOURNAMENT = "/tournaments/:season/:tournament",
  COEFFICIENT = "/coefficient/:season",
  CLUBS = "/clubs",
  AUTH_REDIRECT = `${AUTH_REDIRECT_PATH}/:accessToken/:refreshToken`,
}

export const routes = [
  {
    path: Paths.HOME,
    element: <Home />,
  },
  {
    path: Paths.AUTH_REDIRECT,
    element: <AuthSuccessRedirect />,
  },
  {
    path: Paths.TOURNAMENT,
    element: <Tournament />,
  },
  {
    path: Paths.COEFFICIENT,
    element: <Coefficient />,
  },
  {
    path: Paths.CLUBS,
    element: <Clubs />,
  },
];
