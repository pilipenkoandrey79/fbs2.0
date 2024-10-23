import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";

const LanguagePath: FC = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const { pathname, search } = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (lang) {
      if (
        i18n.options.supportedLngs &&
        i18n.options.supportedLngs.includes(lang)
      ) {
        i18n.changeLanguage(lang);

        return;
      }
    }

    const resolvedLanguage =
      i18n.resolvedLanguage || (i18n.options.fallbackLng as string[])?.[0];

    return navigate(
      "/" + resolvedLanguage + pathname.replace(`${lang}/`, "") + search,
      {
        replace: true,
      }
    );
  }, [i18n, lang, navigate, pathname, search]);

  return <Outlet />;
};

export { LanguagePath };
