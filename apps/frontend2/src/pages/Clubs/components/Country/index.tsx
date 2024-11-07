import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Button, Divider, Table, TableProps } from "antd";
import {
  EditOutlined,
  PlusSquareFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import { City } from "@fbs2.0/types";

import { SubHeader } from "./components/SubHeader";
import { ClubsCell } from "./components/ClubsCell";
import { CV, CVInput } from "./components/CV";
import { ResponsivePanel } from "../../../../components/ResponsivePanel";
import { CityDialog } from "./components/CityDialog";
import { useGetCountries } from "../../../../react-query-hooks/country/useGetCountries";
import {
  ClubsByCity,
  getByCitySelector,
  useGetClubs,
} from "../../../../react-query-hooks/club/useGetClubs";
import { useGetClublessCities } from "../../../../react-query-hooks/city/useGetClublessCities";
import { Paths } from "../../../../routes";
import { Language } from "../../../../i18n/locales";

import styles from "./styles.module.scss";

const Country: FC = () => {
  const { i18n, t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const countries = useGetCountries();
  const clublessCities = useGetClublessCities();
  const country = countries.data?.find((country) => country.code === code);

  const clubsByCities = useGetClubs<ClubsByCity[]>(
    country?.id,
    getByCitySelector(i18n.resolvedLanguage as Language, clublessCities.data),
    clublessCities.isSuccess && countries.isSuccess && !country?.till
  );

  const [cvInput, setCvInput] = useState<CVInput | null>(null);
  const [cityIdToEdit, setCityIdToEdit] = useState<number | null>(null);

  const columns: TableProps<ClubsByCity>["columns"] = [
    {
      key: "city",
      dataIndex: "city",
      width: 100,
      className: styles.cell,
      render: ({ name, name_ua, id }: City) => (
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
      render: (clubs) => (
        <ClubsCell clubs={clubs} cvInput={cvInput} setCvInput={setCvInput} />
      ),
    },
  ];

  useEffect(() => {
    if (countries.isSuccess && !country) {
      navigate(Paths.CLUBS);
    }
  }, [countries.isSuccess, country, navigate]);

  return (
    <>
      <SubHeader country={country}>
        <Button
          icon={<TrophyOutlined />}
          onClick={() => setCvInput({ type: "country", id: country?.id })}
          disabled={cvInput !== null}
        />
        <Divider type="vertical" />
        <Button
          icon={<PlusSquareFilled />}
          type="primary"
          onClick={() => setCityIdToEdit(-1)}
        >
          {t("clubs.add_city")}
        </Button>
      </SubHeader>
      <div className={styles.container}>
        <div className={styles.table}>
          <Table<ClubsByCity>
            columns={columns}
            dataSource={clubsByCities.data}
            rowKey="id"
            size="small"
            pagination={false}
            showHeader={false}
            bordered
            locale={{
              emptyText: !!country?.till && t("clubs.old_country_description"),
            }}
            loading={clubsByCities.isLoading}
          />
        </div>
        <ResponsivePanel
          isOpen={cvInput !== null}
          close={() => setCvInput(null)}
        >
          <CV input={cvInput} />
        </ResponsivePanel>
      </div>
      {cityIdToEdit !== null && (
        <CityDialog
          id={cityIdToEdit}
          countryId={country?.id}
          isEmpty={
            cityIdToEdit >= 0 &&
            clubsByCities.data?.find(({ id }) => id === cityIdToEdit)?.clubs
              .length === 0
          }
          onClose={() => setCityIdToEdit(null)}
        />
      )}
    </>
  );
};

export { Country };
