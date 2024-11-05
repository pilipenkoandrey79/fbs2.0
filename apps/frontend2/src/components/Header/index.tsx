import { FC, ReactNode } from "react";
import { Spin } from "antd";
import classNames from "classnames";

import styles from "./styles.module.scss";

interface Props {
  loading: boolean;
  className?: string;
  children: ReactNode | ReactNode[];
}

const Header: FC<Props> = ({ loading, className, children }) => (
  <div className={classNames(styles.header, className)}>
    <Spin fullscreen spinning={loading} />
    {children}
  </div>
);

export { Header };
