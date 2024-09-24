import { Layout, Spin } from "antd";
import { FC } from "react";

import styles from "./styles.module.scss";

const Fallback: FC = () => (
  <Layout className={styles.fallback}>
    <Spin size="large" />
  </Layout>
);

export { Fallback };
