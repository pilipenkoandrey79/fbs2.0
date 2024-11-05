import { FC, Fragment } from "react";
import { Divider, Skeleton, Typography } from "antd";
import { generatePath, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import classNames from "classnames";

import { useGetCountries } from "../../../../react-query-hooks/country/useGetCountries";
import { Paths } from "../../../../routes";
import { Language } from "../../../../i18n/locales";

import styles from "./styles.module.scss";

const CountriesList: FC = () => {
  const countries = useGetCountries();
  const { i18n } = useTranslation();

  const { old, current } = (countries.data || []).reduce<{
    old: Country[];
    current: Country[];
  }>(
    (acc, country) => {
      if (isNotEmpty(country.till)) {
        acc.old.push(country);
      } else {
        acc.current.push(country);
      }

      return acc;
    },
    { old: [], current: [] }
  );

  return countries.isLoading ? (
    <Skeleton active />
  ) : (
    [
      { key: "current", items: current },
      { key: "old", items: old },
    ].map(({ key, items }, index) => (
      <Fragment key={key}>
        {index > 0 && <Divider type="horizontal" />}
        <div className={styles.countries}>
          {items.map(({ id, name, name_ua, code }) => (
            <Link
              key={id}
              to={generatePath(Paths.COUNTRY_CLUBS, { code })}
              className={classNames(styles.country, styles[key])}
            >
              <img
                alt={code || "xx"}
                src={`./src/assets/flags/${code || "xx"}.svg`}
                height={42}
              />
              <Typography.Text className={styles.name} disabled={key === "old"}>
                {(i18n.resolvedLanguage === Language.en ? name : name_ua) ||
                  name}
              </Typography.Text>
            </Link>
          ))}
        </div>
      </Fragment>
    ))
  );
};

export { CountriesList };
