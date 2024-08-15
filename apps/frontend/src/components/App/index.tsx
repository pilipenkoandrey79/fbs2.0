import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserContext } from "../../context/userContext";
import { useUserContext } from "../../context/useUserContext";
import { routes } from "../../routes";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const router = createBrowserRouter(routes);

const App = () => {
  const currentUser = useUserContext();

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={currentUser}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </QueryClientProvider>
  );
};

export { App };
