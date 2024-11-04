import { FC } from "react";
import { Country } from "@fbs2.0/types";
import classNames from "classnames";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";
import { Language } from "../../i18n/locales";

interface Props {
  country: Country | undefined;
  className?: string;
}

const Flag: FC<Props> = ({ country, className }) => {
  const { i18n } = useTranslation();

  return country ? (
    <Tooltip
      title={
        (i18n.resolvedLanguage === Language.en
          ? country?.name
          : country?.name_ua) || country?.name
      }
      className={className}
    >
      <span
        className={classNames(styles.flag, styles[country?.code || "xx"])}
      />
    </Tooltip>
  ) : null;
};

export { Flag };
