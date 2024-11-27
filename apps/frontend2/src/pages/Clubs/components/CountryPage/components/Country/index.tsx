import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Table, TableProps } from "antd";
import {
  EditOutlined,
  PlusSquareFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import { City, Country as CountryInterface } from "@fbs2.0/types";

import { ClubsCell } from "../ClubsCell";
import { SubHeader } from "../SubHeader";
import { ClubCV } from "../ClubCV";
import { CountryCV } from "../CountryCV";
import { CityDialog } from "../CityDialog";
import { CvContext } from "../../../../../../context/cvContext";
import { ResponsivePanel } from "../../../../../../components/ResponsivePanel";
import { useGetCitiesByCountry } from "../../../../../../react-query-hooks/city/useGetCitiesByCountry";
import { Language } from "../../../../../../i18n/locales";

import styles from "./styles.module.scss";

interface Props {
  country: CountryInterface;
}

const Country: FC<Props> = ({ country }) => {
  const { cvInput, isPending, setCvInput } = useContext(CvContext);
  const { i18n, t } = useTranslation();
  const cities = useGetCitiesByCountry(country.id);
  const [cityIdToEdit, setCityIdToEdit] = useState<number | null>(null);

  const columns: TableProps<City>["columns"] = [
    {
      key: "city",
      width: 100,
      className: styles.cell,
      render: (_, { name, name_ua, id }: City) => (
        <>
          {(i18n.resolvedLanguage === Language.en ? name : name_ua) || name}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            className={styles["edit-city-button"]}
            onClick={() => setCityIdToEdit(id)}
          />
        </>
      ),
    },
    {
      key: "clubs",
      dataIndex: "clubs",
      className: styles.cell,
      render: (clubs, { id: cityId }) => (
        <ClubsCell clubs={clubs} countryId={country.id} cityId={cityId} />
      ),
    },
  ];

  return (
    <>
      <SubHeader country={country}>
        <Button
          icon={<TrophyOutlined />}
          onClick={() => setCvInput({ type: "country", id: country?.id })}
          disabled={isPending || cvInput?.type === "country"}
          loading={isPending}
        />
        <Divider type="vertical" />
        {!country?.till && (
          <Button
            icon={<PlusSquareFilled />}
            type="primary"
            onClick={() => setCityIdToEdit(-1)}
          >
            {t("clubs.add_city")}
          </Button>
        )}
      </SubHeader>
      <div className={styles.container}>
        <div className={styles.table}>
          <Table<City>
            columns={columns}
            dataSource={cities.data ?? []}
            rowKey="id"
            size="small"
            pagination={false}
            showHeader={false}
            bordered
            locale={{
              emptyText: !!country?.till && t("clubs.old_country_description"),
            }}
            loading={cities.isLoading}
          />
        </div>
        <ResponsivePanel
          isOpen={cvInput !== null}
          close={() => {
            setCvInput(null);
          }}
        >
          <>
            {cvInput?.type === "club" && <ClubCV id={cvInput.id} />}
            {cvInput?.type === "country" && <CountryCV id={cvInput.id} />}
          </>
        </ResponsivePanel>
      </div>
      {cityIdToEdit !== null && (
        <CityDialog
          id={cityIdToEdit}
          countryId={country?.id}
          isEmpty={
            cityIdToEdit >= 0 &&
            (cities.data?.find(({ id }) => id === cityIdToEdit)?.clubs
              ?.length || 0) === 0
          }
          onClose={() => setCityIdToEdit(null)}
        />
      )}
    </>
  );
};

export { Country };
