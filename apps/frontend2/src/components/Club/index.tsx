import { Club as ClubInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { Flag } from "../Flag";

import styles from "./styles.module.scss";
import { Language } from "../../i18n/locales";

interface Props {
  club: Partial<ClubInterface>;
  showCountry?: boolean;
  showCity?: boolean;
  expelled?: boolean;
  dimmed?: boolean;
  className?: string;
}

const Club: FC<Props> = ({
  club,
  showCountry = true,
  showCity = true,
  expelled,
  dimmed,
  className,
}) => {
  const { i18n } = useTranslation();

  const cityName =
    club?.name === club?.city?.name
      ? ""
      : (i18n.resolvedLanguage === Language.en
          ? club?.city?.name
          : club.city?.name_ua) || club?.city?.name;

  const city = showCity && cityName;

  return (
    <Typography.Text
      className={classNames(styles.club, className)}
      ellipsis={{ tooltip: club.name }}
      delete={expelled}
      type={dimmed ? "secondary" : undefined}
    >
      {showCountry && (
        <Flag country={club?.city?.country} className={styles.flag} />
      )}
      {(i18n.resolvedLanguage === Language.en ? club?.name : club.name_ua) ||
        club.name}
      {city && <small className={styles.city}>{`(${city})`}</small>}
    </Typography.Text>
  );
};

export { Club };
