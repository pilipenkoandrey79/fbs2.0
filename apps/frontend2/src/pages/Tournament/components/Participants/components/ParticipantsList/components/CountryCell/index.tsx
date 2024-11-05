import { FC } from "react";
import { Club } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { Flag } from "../../../../../../../../components/Flag";
import { Language } from "../../../../../../../../i18n/locales";

import styles from "./styles.module.scss";

interface Props {
  club: Club;
}

const CountryCell: FC<Props> = ({ club }) => {
  const { i18n } = useTranslation();

  return (
    <span className={styles.country}>
      <span className={styles.name}>
        {(i18n.resolvedLanguage === Language.en
          ? club.city.country?.name
          : club.city.country?.name_ua) || club.city.country?.name}
      </span>
      <span className={styles.code}>
        <Flag country={club.city.country} />
      </span>
    </span>
  );
};

export { CountryCell };
