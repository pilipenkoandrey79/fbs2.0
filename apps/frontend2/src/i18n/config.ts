import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import TranslationsAPi, { HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import { Language } from "./locales";

i18n
  .use(TranslationsAPi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    fallbackLng: Language.en,
    debug: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
    supportedLngs: Object.keys(Language),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
