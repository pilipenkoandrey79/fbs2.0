import {
  getSeasonsForCoefficientcalculation,
  sortCoefficientData,
} from "@fbs2.0/utils";
import { Table, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { FC, useContext, useMemo } from "react";
import { generatePath, useParams } from "react-router";
import { useIsMutating } from "@tanstack/react-query";
import {
  ClubTournamentCoefficient,
  CoefficientData,
  CountryClubCoefficient,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
  SeasonCoefficient,
  TournamentSeason,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { createSearchParams } from "react-router";

import { useGetCoefficientData } from "../../../../react-query-hooks/coefficient/useGetCoefficientData";
import { useGetWinners } from "../../../../react-query-hooks/coefficient/useGetWinners";
import { MUTATION_KEY } from "../../../../react-query-hooks/query-key";
import { SortByContext } from "../../../../context/sortByContext";
import { Flag } from "../../../../components/Flag";
import { ClubCell } from "./components/ClubCell";
import { TournamentBadge } from "../../../../components/TournamentBadge";
import { Language } from "../../../../i18n/locales";
import { Paths } from "../../../../routes";

import styles from "./styles.module.scss";

const CoefficientTable: FC = () => {
  const { t, i18n } = useTranslation();
  const { season } = useParams();
  const coefficientsQuery = useGetCoefficientData(season);
  const winners = useGetWinners(season || "");
  const { sortBy } = useContext(SortByContext);

  const seasons = getSeasonsForCoefficientcalculation(season);

  const coefficients = useMemo(
    () => sortCoefficientData(coefficientsQuery.data, sortBy),
    [coefficientsQuery.data, sortBy]
  );

  const columns: TableProps<CoefficientData>["columns"] = [
    {
      key: "no",
      width: 24,
      className: styles.number,
      render: (_, __, index) => index + 1,
      fixed: "left",
    },
    {
      key: "country",
      dataIndex: "country",
      title: t("common.country"),
      render: (country) => (
        <>
          <Flag country={country} className={styles.flag} />
          <span>
            {(i18n.resolvedLanguage === Language.en
              ? country?.name
              : country?.name_ua) || country?.name}
          </span>
        </>
      ),
      fixed: "left",
    },
    {
      key: "coefficient",
      title: t("coefficient.columns.coefficient"),
      children: [
        {
          dataIndex: "coefficient",
          className: styles["coefficient-0"],
          title: season,
          key: season,
          width: 55,
          render: (value) => value.toFixed(3),
        },
        ...seasons
          .filter(({ label }) => label !== season)
          .map<ColumnType<CoefficientData>>(({ label, key }, index) => ({
            width: 55,
            key,
            title: label,
            dataIndex: "seasonCoefficients",
            className: styles[`coefficient-${index + 1}`],
            render: (seasonCoefficients: SeasonCoefficient[]) =>
              seasonCoefficients
                .find((item) => item.season === label)
                ?.coefficient.toFixed(3),
          })),
      ],
    },
    {
      key: "total-coefficient",
      dataIndex: "totalCoefficient",
      className: styles["total-coefficient"],
      width: 62,
      title: t("coefficient.columns.sum"),
      render: (value) => value.toFixed(3),
      fixed: "right",
    },
  ];

  const expandColumns: TableProps<CountryClubCoefficient>["columns"] = [
    {
      key: "name",
      dataIndex: "club",
      minWidth: 100,
      render: (club) => <ClubCell club={club} winners={winners.data} />,
    },
    {
      key: "participations",
      dataIndex: "participations",
      className: styles["no-wrap"],
      width: 170,
      render: (participations: ClubTournamentCoefficient[], { club }) =>
        participations.map(({ tournament, coefficient }) => (
          <TournamentBadge
            key={`${tournament}-${coefficient}`}
            tournamentSeason={{ tournament, season } as TournamentSeason}
            linkTo={
              generatePath(Paths.TOURNAMENT, {
                season: season || "",
                tournament,
              }) +
              `?${createSearchParams([
                [HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${club?.id}`],
              ])}`
            }
          />
        )),
    },
    {
      key: "coefficient",
      dataIndex: "coefficient",
      className: styles["no-wrap"],
      minWidth: 55,
      render: (coefficient) => coefficient.toFixed(3),
    },
  ];

  const expandedRowRender = ({ clubs }: CoefficientData) => (
    <Table<CountryClubCoefficient>
      columns={expandColumns}
      dataSource={clubs}
      pagination={false}
      showHeader={false}
      rowKey={({ club }) => club.id}
      size="small"
      bordered
      tableLayout="fixed"
      summary={(data) => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              {`(${data
                .map(({ coefficient }) => coefficient)
                .join(" + ")} = ${data.reduce<number>(
                (acc, { coefficient }) => acc + coefficient,
                0
              )}) / ${data.length}`}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );

  return (
    <div className={styles.root}>
      <Table<CoefficientData>
        loading={
          useIsMutating({ mutationKey: [MUTATION_KEY.calculateCoefficients] }) >
            0 || coefficientsQuery.isLoading
        }
        columns={columns}
        dataSource={coefficients}
        size="small"
        pagination={false}
        bordered
        rowKey={({ country }) => country.id}
        scroll={{ x: "max-content" }}
        sticky={{ offsetHeader: 0 }}
        expandable={{
          expandedRowRender,
          columnWidth: 20,
          indentSize: 5,
        }}
      />
    </div>
  );
};

export { CoefficientTable };
