import { Balance as BalanceInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Flex, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import ReactECharts from "echarts-for-react";
import { useMediaQuery } from "react-responsive";

import styles from "./styles.module.scss";
import variables from "../../style/variables.module.scss";
import colors from "../../style/colors.module.scss";

interface Props {
  balance: BalanceInterface | undefined;
  showGraph?: boolean;
}

const Balance: FC<Props> = ({ balance, showGraph = true }) => {
  const { t } = useTranslation();
  const { w = 0, d = 0, l = 0, u = 0 } = { ...balance };

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  return (
    <Flex vertical align="center">
      {showGraph && (
        <ReactECharts
          className={styles.graph}
          option={{
            tooltip: {
              trigger: "item",
            },
            grid: { top: 0, left: 0, right: 0, bottom: 0 },
            series: [
              {
                name: t("clubs.club.club_cv.balance"),
                type: "pie",
                radius: ["40%", "85%"],
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                },
                data: [
                  {
                    value: w,
                    name: t("common.balance.win"),
                    itemStyle: { color: colors.win },
                  },
                  {
                    value: d,
                    name: t("common.balance.draw"),
                    itemStyle: { color: colors.draw },
                  },
                  {
                    value: l,
                    name: t("common.balance.loss"),
                    itemStyle: { color: colors.loss },
                  },
                  {
                    value: u,
                    name: t("common.balance.undefined"),
                    itemStyle: { color: colors.undefined },
                  },
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
          }}
          style={
            isMdScreen
              ? { width: 160, height: 160 }
              : { width: 120, height: 120 }
          }
        />
      )}
      <div className={styles.balance}>
        <Tooltip title={t("common.balance.win")}>
          <span
            className={classNames(styles.value, styles.win)}
          >{`+${w}`}</span>
        </Tooltip>
        <Tooltip title={t("common.balance.draw")}>
          <span
            className={classNames(styles.value, styles.drw)}
          >{`=${d}`}</span>
        </Tooltip>
        <Tooltip title={t("common.balance.loss")}>
          <span
            className={classNames(styles.value, styles.los)}
          >{`-${l}`}</span>
        </Tooltip>
        {u > 0 && (
          <Tooltip title={t("common.balance.undefined")}>
            <span
              className={classNames(styles.value, styles.und)}
            >{`?${u}`}</span>
          </Tooltip>
        )}
      </div>
    </Flex>
  );
};

export { Balance };
