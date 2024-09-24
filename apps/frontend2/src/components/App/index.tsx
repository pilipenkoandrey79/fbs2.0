import { FC, Suspense, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Fallback } from "../Fallback";
import { routes } from "../../routes";
import { queryClient } from "../../react-query-hooks/client";
import { theme } from "../../style/theme";
import { Language, locales } from "../../i18n/locales";

const router = createBrowserRouter(routes);

const App: FC = () => {
  const [lang, setLang] = useState(Language.en);
  const { i18n } = useTranslation();

  useEffect(() => {
    setLang(i18n.resolvedLanguage as Language);
    dayjs.locale(i18n.resolvedLanguage);
  }, [i18n.resolvedLanguage, setLang]);

  return (
    <Suspense fallback={<Fallback />}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme} locale={locales[lang]}>
          <RouterProvider router={router} fallbackElement={<Fallback />} />
        </ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Suspense>
  );
};

export { App };
