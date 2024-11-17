import { Balance as BalanceInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";

interface Props {
  balance: BalanceInterface | undefined;
}

const Balance: FC<Props> = ({ balance }) => {
  const { t } = useTranslation();

  return (
    <span className={styles.balance}>
      <Tooltip title={t("common.balance.win")}>
        <span className={classNames(styles.value, styles.win)}>{`+${
          balance?.w || 0
        }`}</span>
      </Tooltip>
      <Tooltip title={t("common.balance.draw")}>
        <span className={classNames(styles.value, styles.drw)}>{`=${
          balance?.d || 0
        }`}</span>
      </Tooltip>
      <Tooltip title={t("common.balance.loss")}>
        <span className={classNames(styles.value, styles.los)}>{`-${
          balance?.l || 0
        }`}</span>
      </Tooltip>
      {(balance?.u || 0) > 0 && (
        <Tooltip title={t("common.balance.undefined")}>
          <span className={classNames(styles.value, styles.und)}>{`-${
            balance?.u || 0
          }`}</span>
        </Tooltip>
      )}
    </span>
  );
};

export { Balance };
