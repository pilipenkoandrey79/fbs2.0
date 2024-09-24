import { AUTH_REDIRECT_PATH } from "@fbs2.0/types";
import { RouteObject } from "react-router";

import { AuthSuccessRedirect } from "./components/AuthSuccessRedirect";
import { LanguagePath } from "./components/LanguagePath";

export enum Paths {
  HOME = "/",
  TOURNAMENT = "/tournaments/:season/:tournament",
  COEFFICIENT = "/coefficient/:season",
  CLUBS = "/clubs",
  AUTH_REDIRECT = `${AUTH_REDIRECT_PATH}/:accessToken/:refreshToken`,
}

const getLocalizedPath = (path: Paths) => `/:lang?${path}`;

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LanguagePath />,
    children: [
      {
        path: getLocalizedPath(Paths.HOME),
        async lazy() {
          const { Home } = await import("./pages/Home");

          return { Component: Home };
        },
      },
      {
        path: getLocalizedPath(Paths.TOURNAMENT),
        async lazy() {
          const { Tournament } = await import("./pages/Tournament");

          return { Component: Tournament };
        },
      },
      {
        path: getLocalizedPath(Paths.COEFFICIENT),
        async lazy() {
          const { Coefficient } = await import("./pages/Coefficient");

          return { Component: Coefficient };
        },
      },
      {
        path: getLocalizedPath(Paths.CLUBS),
        async lazy() {
          const { Clubs } = await import("./pages/Clubs");

          return { Component: Clubs };
        },
      },
    ],
  },
  {
    path: Paths.AUTH_REDIRECT,
    element: <AuthSuccessRedirect />,
  },
];
