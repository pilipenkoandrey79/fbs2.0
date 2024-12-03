import { AUTH_REDIRECT_PATH } from "@fbs2.0/types";
import { RouteObject } from "react-router";

import { AuthSuccessRedirect } from "./components/AuthSuccessRedirect";
import { LanguagePath } from "./components/LanguagePath";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Fallback } from "./components/Fallback";

export enum Paths {
  HOME = "/",
  TOURNAMENT = "/tournaments/:season/:tournament",
  COEFFICIENT = "/coefficient/:season",
  CLUBS = "/clubs",
  COUNTRY_CLUBS = ":code",
  AUTH_REDIRECT = `${AUTH_REDIRECT_PATH}/:accessToken/:refreshToken`,
}

export const LANG_SEGMENT = "/:lang?";

const getLocalizedPath = (path: Paths) => `${LANG_SEGMENT}${path}`;

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LanguagePath />,
    errorElement: <ErrorBoundary />,
    HydrateFallback: Fallback,
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
        children: [
          {
            index: true,
            async lazy() {
              const { CountriesList } = await import(
                "./pages/Clubs/components/CountriesList"
              );

              return { Component: CountriesList };
            },
          },
          {
            path: Paths.COUNTRY_CLUBS,
            async lazy() {
              const { CountryPage } = await import(
                "./pages/Clubs/components/CountryPage"
              );

              return { Component: CountryPage };
            },
          },
        ],
      },
    ],
  },
  {
    path: Paths.AUTH_REDIRECT,
    element: <AuthSuccessRedirect />,
  },
];
