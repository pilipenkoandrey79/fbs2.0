import { FC, useState } from "react";
import { Club as ClubInterface, Country } from "@fbs2.0/types";
import { Skeleton, Switch, Table, TableProps, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { useGetIntegratedSummary } from "../../../../react-query-hooks/tournament/useGetIntegratedSummary";
import { Flag } from "../../../../components/Flag";
import { Club } from "../../../../components/Club";

import styles from "./styles.module.scss";

interface ListItem {
  item: ClubInterface | Country;
  year: number;
  number?: number;
}

const Winners: FC = () => {
  const { t } = useTranslation();
  const integratedSummary = useGetIntegratedSummary();
  const [showFinalists, setShowFinalists] = useState(false);
  const [byCountries, setByCountries] = useState(false);

  const list = Object.entries(integratedSummary.data || {})
    .reduce<ListItem[]>((acc, [season, tournaments]) => {
      const end = Number(season.split("-")[1]);

      tournaments.forEach(({ winner, finalist }) => {
        if (!winner) {
          return acc;
        }

        const existWinnerIndex = acc.findIndex(
          ({ item }) =>
            item?.id ===
            (byCountries ? winner?.club.city.country.id : winner?.club.id)
        );

        if (existWinnerIndex < 0) {
          acc.push({
            item: (byCountries ? winner?.club.city.country : winner?.club) as
              | ClubInterface
              | Country,
            year: end,
            number: 1,
          });
        } else {
          acc[existWinnerIndex].number =
            (acc[existWinnerIndex].number || 0) + 1;
        }

        if (showFinalists) {
          const existFinalistIndex = acc.findIndex(
            ({ item }) =>
              item?.id ===
              (byCountries ? finalist?.club.city.country.id : finalist?.club.id)
          );

          if (existFinalistIndex < 0) {
            acc.push({
              item: (byCountries
                ? finalist?.club.city.country
                : finalist?.club) as ClubInterface | Country,
              year: end,
              number: 1,
            });
          } else {
            acc[existFinalistIndex].number =
              (acc[existFinalistIndex].number || 0) + 1;
          }
        }
      });

      return acc;
    }, [])
    .sort((a, b) => a.year - b.year);

  const columns: TableProps<ListItem>["columns"] = [
    { key: "no", width: 30, render: (_, __, index) => index + 1 },
    {
      key: "year",
      width: 60,
      title: (
        <Tooltip
          title={t(
            `home.${showFinalists ? "first_final_year" : "first_win_year"}`
          )}
        >
          {t("common.year")}
        </Tooltip>
      ),
      dataIndex: "year",
    },
    {
      key: "item",
      dataIndex: "item",
      title: t(`common.${byCountries ? "country" : "club"}`),
      width: 200,
      render: (item, { number }) => (
        <>
          {byCountries ? (
            <>
              <Flag country={item as Country} /> <span>{item?.name}</span>
            </>
          ) : (
            <Club club={item} />
          )}
          <span className={styles["item-number"]}>
            {t(`home.${showFinalists ? "finals" : "titles"}`, { number })}
          </span>
        </>
      ),
    },
  ];

  return integratedSummary.isLoading ? (
    <Skeleton active />
  ) : (
    <div>
      <div className={styles.tools}>
        <div>
          <label>{t("home.by_countries")}</label>
          <Switch
            checked={byCountries}
            onChange={() => setByCountries(!byCountries)}
          />
        </div>
        <div>
          <label>{t("home.finalists")}</label>
          <Switch
            checked={showFinalists}
            onChange={() => setShowFinalists(!showFinalists)}
          />
        </div>
      </div>
      <Table<ListItem>
        dataSource={list}
        columns={columns}
        size="small"
        bordered={false}
        pagination={false}
        tableLayout="auto"
        rowKey={({ item }) => item.id}
      />
    </div>
  );
};

export { Winners };
