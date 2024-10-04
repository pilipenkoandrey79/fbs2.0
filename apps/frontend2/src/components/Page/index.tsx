import { Layout, message } from "antd";
import { FC, ReactNode, useEffect, useState } from "react";
import { DatabaseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { AxiosError } from "axios";
import { Helmet } from "react-helmet-async";

import { Fallback } from "../Fallback";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { LoginButton } from "./components/LoginButton";
import { Paths } from "../../routes";
import { useCurrentPath } from "../../hooks/useCurrentPath";

import styles from "./styles.module.scss";

interface Props {
  children: ReactNode | ReactNode[];
  title: string;
  menu?: ReactNode;
  isLoading?: boolean;
  errors?: (Error | AxiosError | null)[] | null;
}

const Page: FC<Props> = (props) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const [errors, setErrors] = useState<(Error | AxiosError | null)[] | null>(
    null
  );

  const currentPath = useCurrentPath();
  const isHome = currentPath === Paths.HOME;
  const isClubsPage = currentPath === Paths.CLUBS;

  useEffect(() => {
    setErrors(
      props.errors && props.errors.length > 0
        ? props.errors?.filter((error) => !!error)
        : null
    );
  }, [props.errors]);

  useEffect(() => {
    if (errors && errors.length > 0) {
      errors
        .filter((error) => !!error)
        .forEach((error) => messageApi.error(error.message));
    }
  }, [errors, messageApi]);

  return (
    <Layout className={styles.layout}>
      <Helmet>
        <title>{props.title}</title>
      </Helmet>
      <Layout.Header>
        <h1>
          <Link to={Paths.HOME} className={classNames({ disabled: isHome })}>
            FBS2
          </Link>
        </h1>
        <div className={styles.menu}>{props.menu}</div>
        <div className={styles.tools}>
          {!isClubsPage && (
            <Link to={Paths.CLUBS} className={styles.link}>
              <DatabaseOutlined />
              <span className={styles["link-text"]}>{t("common.clubs")}</span>
            </Link>
          )}
          <LanguageSwitcher className={styles["language-swaitcher"]} />
          <LoginButton setErrors={setErrors} />
        </div>
      </Layout.Header>
      <Layout.Content
        className={classNames({ [styles.fallback]: props.isLoading })}
      >
        {contextHolder}
        {props.isLoading ? <Fallback /> : props.children}
      </Layout.Content>
      <Layout.Footer>FBS ©{new Date().getFullYear()}</Layout.Footer>
    </Layout>
  );
};

export { Page };
