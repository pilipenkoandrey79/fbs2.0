import { matchRoutes, useLocation } from "react-router";

import { routes } from "../routes";

export const useCurrentPath = () => {
  const location = useLocation();
  const matchedRoutes = matchRoutes(routes, location) ?? [];

  return matchedRoutes[0].route.path;
};
