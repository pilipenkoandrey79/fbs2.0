import { FC, Suspense, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";

import { Fallback } from "../Fallback";
import { routes } from "../../routes";
import { queryClient } from "../../react-query-hooks/client";
import { theme } from "../../style/theme";
import { Language, locales } from "../../i18n/locales";
import { UserContext } from "../../context/userContext";
import { useUserContext } from "../../context/useUserContext";

const router = createBrowserRouter(routes);

const App: FC = () => {
  const [lang, setLang] = useState(Language.en);
  const { i18n } = useTranslation();
  const currentUser = useUserContext();

  useEffect(() => {
    setLang(i18n.resolvedLanguage as Language);
    dayjs.locale(i18n.resolvedLanguage);
  }, [i18n.resolvedLanguage, setLang]);

  return (
    <Suspense fallback={<Fallback page />}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ConfigProvider theme={theme} locale={locales[lang]}>
            <UserContext.Provider value={currentUser}>
              <RouterProvider router={router} fallbackElement={<Fallback />} />
            </UserContext.Provider>
          </ConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </HelmetProvider>
      </QueryClientProvider>
    </Suspense>
  );
};

export { App };
