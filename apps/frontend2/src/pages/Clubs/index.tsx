import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "antd";
import { Outlet } from "react-router";

import { Page } from "../../components/Page";
import { Header } from "../../components/Header";
import { useGetCountries } from "../../react-query-hooks/country/useGetCountries";

import styles from "./styles.module.scss";

const Clubs: FC = () => {
  const { t } = useTranslation();

  const countries = useGetCountries();
  const title = t("clubs.title");

  return (
    <Page title={title}>
      <div className={styles.container}>
        <Header loading={countries.isLoading} className={styles.header}>
          <Typography.Title>{title}</Typography.Title>
        </Header>
        <Outlet />
      </div>
    </Page>
  );
};

export { Clubs };
