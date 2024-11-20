import { FC } from "react";
import { Divider, Flex, Skeleton, Table, TableProps, Tooltip } from "antd";
import { CalendarOutlined, TrophyTwoTone } from "@ant-design/icons";
import {
  CountryCVStatus,
  CountryCV as CountryCVInterface,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { useGetCountryCV } from "../../../../../../react-query-hooks/country/useGetCountryCV";

import styles from "./styles.module.scss";
import colors from "../../../../../../style/colors.module.scss";

interface Props {
  id: number | undefined;
}

const CountryCV: FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const cv = useGetCountryCV(id);

  const columns: TableProps<CountryCVInterface>["columns"] = [
    {
      key: "season",
      dataIndex: "tournamentSeason",
      render: ({ season }) => season,
    },
    {
      key: "tournament",
      dataIndex: "tournamentSeason",
      render: ({ tournament }) => tournament,
    },
    { key: "status" },
    { key: "club" },
  ];

  return cv.isLoading ? (
    <Skeleton active />
  ) : (
    <div className={styles.cv}>
      <Flex gap={8} className={styles.titles}>
        <Tooltip title={t("clubs.country_cv.finals")}>
          <CalendarOutlined />
        </Tooltip>
        <span>{cv.data?.length || 0}</span>
        <Tooltip title={t("clubs.country_cv.titles")}>
          <TrophyTwoTone twoToneColor={colors.golden} />
        </Tooltip>
        <span>
          {cv.data?.reduce<number>(
            (acc, { status }) =>
              acc + (status === CountryCVStatus.RunnerUp ? 0 : 1),
            0
          )}
        </span>
      </Flex>
      <Divider />
      <div className={styles.table}>
        <Table<CountryCVInterface>
          columns={columns}
          dataSource={cv.data ?? []}
          rowKey={(record) => record.tournamentSeason.id}
          size="small"
          pagination={false}
          showHeader={false}
          bordered
          loading={cv.isLoading}
        />
      </div>
    </div>
  );
};

export { CountryCV };
