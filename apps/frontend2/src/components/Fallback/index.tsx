import { Layout, Spin } from "antd";
import { FC } from "react";
import classNames from "classnames";

import styles from "./styles.module.scss";

interface Props {
  page?: boolean;
}

const Fallback: FC<Props> = ({ page }) => (
  <Layout className={classNames(styles.fallback, { [styles.page]: page })}>
    <Spin size="large" />
  </Layout>
);

export { Fallback };
