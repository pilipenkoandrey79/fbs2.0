import { useNavigate, useRouteError } from "react-router";
import { FC } from "react";
import { Button, Result } from "antd";
import { AxiosError, HttpStatusCode } from "axios";
import { useTranslation } from "react-i18next";

import { Paths } from "../../routes";
import { LanguageSwitcher } from "../LanguageSwitcher";

import RedCard from "../../assets/red-card.png";

import styles from "./styles.module.scss";

const ErrorBoundary: FC = () => {
  const error = useRouteError() as AxiosError;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const is404 = error?.response?.status === HttpStatusCode.NotFound;

  return (
    <div className={styles.root}>
      <div className={styles["language-swaitcher"]}>
        <LanguageSwitcher />
      </div>
      <Result
        title={t(`error_page.title${is404 ? "_404" : ""}`)}
        subTitle={t(`error_page.subtitle${is404 ? "_404" : ""}`)}
        extra={
          <Button type="primary" onClick={() => navigate(Paths.HOME)}>
            {t("error_page.button")}
          </Button>
        }
        icon={<img src={RedCard} alt="red card" width={100} />}
      />
    </div>
  );
};

export { ErrorBoundary };
