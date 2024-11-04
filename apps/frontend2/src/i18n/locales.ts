import enUS from "antd/locale/en_US";
import ukUA from "antd/locale/uk_UA";

import "dayjs/locale/en";
import "dayjs/locale/uk";

export enum Language {
  en = "en",
  ua = "ua",
}

export const antLocales = {
  [Language.en]: enUS,
  [Language.ua]: ukUA,
};

export const BCP47Locales = {
  [Language.en]: "en",
  [Language.ua]: "uk",
};
