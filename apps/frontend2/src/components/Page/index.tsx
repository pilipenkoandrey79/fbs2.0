import { Button, Layout, message, Spin } from "antd";
import { FC, ReactNode, useContext, useEffect } from "react";
import {
  DatabaseOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ApiEntities } from "@fbs2.0/types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { LanguageSwitcher } from "../LanguageSwitcher";
import { UserContext } from "../../context/userContext";
import backendUrl from "../../api/backend-url";
import { removeApiToken } from "../../utils/api-token";
import { removeRefreshToken } from "../../utils/refresh-token";
import { Paths } from "../../routes";
import { useCurrentPath } from "../../hooks/useCurrentPath";
import { usePrevious } from "../../hooks/usePrevious";

import styles from "./styles.module.scss";

interface Props {
  children: ReactNode | ReactNode[];
  isLoading?: boolean;
  error?: Error | null;
}

const Page: FC<Props> = ({ children, isLoading, error }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const { user, setUser } = useContext(UserContext);
  const previousError = usePrevious(error);
  const currentPath = useCurrentPath();

  const isHome = currentPath === Paths.HOME;
  const isClubsPage = currentPath === Paths.CLUBS;

  const login = async () => {
    try {
      window.open(`${backendUrl}${ApiEntities.Auth}/google`, "_self");
    } catch (error) {
      messageApi.error(
        typeof error === "string" ? error : (error as Error).message || "Error"
      );
    }
  };

  const logout = () => {
    removeApiToken();
    removeRefreshToken();
    setUser(undefined);
  };

  useEffect(() => {
    if (!!error && !previousError) {
      messageApi.error(error.message);
    }
  }, [error, messageApi, previousError]);

  return (
    <Layout className={styles.layout}>
      <Layout.Header>
        <h1>
          <Link
            to={Paths.HOME}
            className={classNames({ [styles.home]: isHome })}
          >
            FBS2
          </Link>
        </h1>
        <div className={styles.tools}>
          {!isClubsPage && (
            <Link to={Paths.CLUBS} className={styles.link}>
              <DatabaseOutlined />
              {t("common.clubs")}
            </Link>
          )}
          <LanguageSwitcher className={styles["language-swaitcher"]} />
          <Button
            type="default"
            shape="circle"
            icon={user ? <LogoutOutlined /> : <LoginOutlined />}
            onClick={user ? logout : login}
          />
        </div>
      </Layout.Header>
      <Layout.Content>
        {contextHolder}
        {isLoading || error ? (
          <div className={styles.spinner}>
            <Spin size="large" />
          </div>
        ) : (
          children
        )}
      </Layout.Content>
      <Layout.Footer>FBS ©{new Date().getFullYear()}</Layout.Footer>
    </Layout>
  );
};

export { Page };
