import { FC } from "react";
import { Country } from "@fbs2.0/types";
import classNames from "classnames";
import { Tooltip } from "antd";

import styles from "./styles.module.scss";

interface Props {
  country: Country | undefined;
  className?: string;
}

const Flag: FC<Props> = ({ country, className }) =>
  country ? (
    <Tooltip title={country?.name} className={className}>
      <span
        className={classNames(styles.flag, styles[country?.code || "xx"])}
      />
    </Tooltip>
  ) : null;

export { Flag };
