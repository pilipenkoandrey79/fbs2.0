import { Club as ClubInterface, CV_SEARCH_PARAMETER } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { createSearchParams, generatePath, Link } from "react-router-dom";

import { Flag } from "../Flag";
import { Language } from "../../i18n/locales";
import { Paths } from "../../routes";

import styles from "./styles.module.scss";

interface Props {
  club: Partial<ClubInterface>;
  className?: string;
  to?: string | false;

  showCountry?: boolean;
  showCity?: boolean;
  expelled?: boolean;
  dimmed?: boolean;
  tooltip?: string;
}

const Club: FC<Props> = ({
  club,
  className,
  to,
  showCountry = true,
  showCity = true,
  expelled,
  dimmed,
  tooltip,
}) => {
  const { i18n } = useTranslation();

  const cityName =
    club?.name === club?.city?.name
      ? ""
      : (i18n.resolvedLanguage === Language.en
          ? club?.city?.name
          : club.city?.name_ua) || club?.city?.name;

  const city = showCity && cityName;

  const content = (
    <Tooltip title={tooltip}>
      <Typography.Text
        ellipsis={{ tooltip: club.name }}
        delete={expelled}
        type={dimmed ? "secondary" : undefined}
        className={classNames(styles.club, className)}
      >
        {showCountry && (
          <Flag country={club?.city?.country} className={styles.flag} />
        )}
        {(i18n.resolvedLanguage === Language.en ? club?.name : club.name_ua) ||
          club.name}
        {city && <small className={styles.city}>{`(${city})`}</small>}
      </Typography.Text>
    </Tooltip>
  );

  return to === false ? (
    content
  ) : (
    <Link
      to={
        to ||
        `${generatePath(Paths.CLUBS)}/${generatePath(Paths.COUNTRY_CLUBS, {
          code: `${club.city?.country.code}`,
        })}?${createSearchParams([[CV_SEARCH_PARAMETER, `club-${club.id}`]])}`
      }
      className={styles["club-link"]}
    >
      {content}
    </Link>
  );
};

export { Club };
