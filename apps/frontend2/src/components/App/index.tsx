import { FC, Suspense, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import { RouterProvider, createBrowserRouter } from "react-router";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

import { Fallback } from "../Fallback";
import { routes } from "../../routes";
import { queryClient } from "../../react-query-hooks/client";
import { myTheme } from "../../style/theme";
import { Language, antLocales, BCP47Locales } from "../../i18n/locales";
import { UserContext } from "../../context/userContext";
import { useUserContext } from "../../context/useUserContext";

const router = createBrowserRouter(routes);

const App: FC = () => {
  const { token } = theme.useToken();
  const [lang, setLang] = useState(Language.en);
  const { i18n } = useTranslation();
  const currentUser = useUserContext();

  useEffect(() => {
    setLang(i18n.resolvedLanguage as Language);
    dayjs.locale(BCP47Locales[i18n.resolvedLanguage as Language]);
  }, [i18n.resolvedLanguage, setLang]);

  return (
    <Suspense fallback={<Fallback page />}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ConfigProvider theme={myTheme} locale={antLocales[lang]}>
            <UserContext.Provider value={currentUser}>
              <RouterProvider router={router} />
            </UserContext.Provider>
          </ConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </HelmetProvider>
        <Toaster toastOptions={{ style: { fontFamily: token.fontFamily } }} />
      </QueryClientProvider>
    </Suspense>
  );
};

export { App };
