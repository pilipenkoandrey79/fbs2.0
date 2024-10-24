import { FC, useState } from "react";
import { Club as ClubInterface, Country } from "@fbs2.0/types";
import { Switch, Table, TableProps } from "antd";
import { useTranslation } from "react-i18next";

import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { Flag } from "../../../../components/Flag";
import { Club } from "../../../../components/Club";

import styles from "./styles.module.scss";

interface ListItem {
  item: ClubInterface | Country;
  year: number;
}

const Winners: FC = () => {
  const { t } = useTranslation();
  const availableTournaments = useGetTournamentSeasons(false);
  const [showFinalists, setShowFinalists] = useState(false);
  const [byCountries, setByCountries] = useState(false);

  const list = Object.entries(availableTournaments.data || {})
    .reduce<ListItem[]>((acc, [season, tournaments]) => {
      const end = Number(season.split("-")[1]);

      tournaments.forEach(({ winner, finalist }) => {
        if (!winner) {
          return acc;
        }

        const isExistAsWinner = acc.find(
          ({ item }) =>
            item?.id ===
            (byCountries ? winner?.club.city.country.id : winner?.club.id)
        );

        if (!isExistAsWinner) {
          acc.push({
            item: (byCountries ? winner?.club.city.country : winner?.club) as
              | ClubInterface
              | Country,
            year: end,
          });
        }

        if (showFinalists) {
          const isExistAsFinalist = acc.find(
            ({ item }) =>
              item?.id ===
              (byCountries ? finalist?.club.city.country.id : finalist?.club.id)
          );

          if (!isExistAsFinalist) {
            acc.push({
              item: (byCountries
                ? finalist?.club.city.country
                : finalist?.club) as ClubInterface | Country,
              year: end,
            });
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
      width: 100,
      title: t(`home.${showFinalists ? "first_final_year" : "first_win_year"}`),
      dataIndex: "year",
    },
    {
      key: "item",
      dataIndex: "item",
      title: t(`common.${byCountries ? "country" : "club"}`),
      width: 200,
      ellipsis: true,
      render: (item) =>
        byCountries ? (
          <>
            <Flag country={item as Country} /> <span>{item?.name}</span>
          </>
        ) : (
          <Club club={item} />
        ),
    },
  ];

  return (
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
      />
    </div>
  );
};

export { Winners };
