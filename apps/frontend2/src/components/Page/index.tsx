import { FloatButton, Layout } from "antd";
import { FC, ReactNode } from "react";
import { DatabaseOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
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
  className?: string;
}

const Page: FC<Props> = (props) => {
  const { t } = useTranslation();
  const currentPath = useCurrentPath();
  const isHome = currentPath === Paths.HOME;
  const isClubsPage = currentPath === Paths.CLUBS;

  return (
    <Layout className={classNames(props.className, styles.layout)}>
      <Helmet>
        <title>{["FBS2", props.title].join(" | ")}</title>
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
          <LoginButton />
        </div>
      </Layout.Header>
      <Layout.Content
        className={classNames({ [styles.fallback]: props.isLoading })}
      >
        {props.isLoading ? <Fallback /> : props.children}
      </Layout.Content>
      <Layout.Footer>FBS ©{new Date().getFullYear()}</Layout.Footer>
      <FloatButton.BackTop />
    </Layout>
  );
};

export { Page };
