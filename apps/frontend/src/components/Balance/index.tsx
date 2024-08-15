import { Tooltip } from "@blueprintjs/core";
import { Balance as BalanceInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";

import styles from "./styles.module.scss";

interface Props {
  balance: BalanceInterface | undefined;
}

const Balance: FC<Props> = ({ balance }) => (
  <span className={styles.balance}>
    <Tooltip content="Кількість перемог">
      <span className={classNames(styles.value, styles.win)}>{`+${
        balance?.w || 0
      }`}</span>
    </Tooltip>
    <Tooltip content="Кількість нічиїх">
      <span className={classNames(styles.value, styles.drw)}>{`=${
        balance?.d || 0
      }`}</span>
    </Tooltip>
    <Tooltip content="Кількість поразок">
      <span className={classNames(styles.value, styles.los)}>{`-${
        balance?.l || 0
      }`}</span>
    </Tooltip>
    {(balance?.u || 0) > 0 && (
      <Tooltip content="Кількість незіграних матчів">
        <span className={classNames(styles.value, styles.und)}>{`-${
          balance?.u || 0
        }`}</span>
      </Tooltip>
    )}
  </span>
);

export { Balance };
