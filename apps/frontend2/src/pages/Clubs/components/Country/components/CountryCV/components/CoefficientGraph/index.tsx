import { FC } from "react";
import { Flex, Skeleton } from "antd";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import { EChartsOption } from "echarts";

import { useGetCoefficientHistoryGraph } from "../../../../../../../../react-query-hooks/coefficient/useGetCoefficientHistoryGraph";

import styles from "./styles.module.scss";
import colors from "../../../../../../../../style/colors.module.scss";

interface Props {
  countryId: number;
}

const CoefficientGraph: FC<Props> = ({ countryId }) => {
  const { t } = useTranslation();
  const graphData = useGetCoefficientHistoryGraph(countryId);

  return graphData.isLoading ? (
    <Flex align="center" justify="center" className={styles.skeleton}>
      <Skeleton.Node active />
    </Flex>
  ) : (
    <Flex justify="center">
      <ReactECharts
        className={styles.graph}
        option={
          {
            grid: { top: 40, left: "10%", right: "10%", bottom: 70 },
            textStyle: {
              fontFamily: "-apple-system, 'Oswald', sans-serif",
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross",
                crossStyle: {
                  color: "#999",
                },
              },
            },
            dataZoom: [
              {
                type: "inside",
                filterMode: "weakFilter",
                moveOnMouseMove: true,
              },
              {
                type: "slider",
                filterMode: "weakFilter",
                moveOnMouseMove: true,
                fillerColor: colors.silver,
                borderColor: colors.primaryBase,
                handleStyle: { borderColor: colors.primaryBase },
                moveHandleStyle: { color: colors.primaryBase },
                emphasis: {
                  handleStyle: {
                    borderColor: colors.primaryBase,
                    opacity: 0.5,
                  },
                  moveHandleStyle: {
                    color: colors.primaryBase,
                    opacity: 0.5,
                  },
                },
              },
            ],
            toolbox: {
              show: true,
              feature: { restore: { show: true, title: t("common.restore") } },
            },
            xAxis: {
              type: "category",
              data: graphData.data?.map(({ season }) => season),
            },
            yAxis: [{ type: "value" }, { type: "value" }],
            series: [
              {
                data: graphData.data?.map(({ rank }) => rank),
                yAxisIndex: 0,
                type: "bar",
                itemStyle: {
                  color: colors.coefficientBar,
                },
                tooltip: {
                  valueFormatter: (_, dataIndex) => {
                    const { place, places } = {
                      ...graphData.data?.at(dataIndex),
                    };

                    return t("clubs.country_cv.graph_tooltip", {
                      place,
                      places,
                    });
                  },
                },
              },
              {
                type: "line",
                itemStyle: {
                  color: colors.coefficientLine,
                },
                yAxisIndex: 1,
                data: graphData.data?.map(
                  ({ totalCoefficient }) => totalCoefficient
                ),
              },
            ],
          } as EChartsOption
        }
      />
    </Flex>
  );
};

export { CoefficientGraph };
