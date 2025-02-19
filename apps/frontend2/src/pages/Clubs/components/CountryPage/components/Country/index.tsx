import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Table, TableProps } from "antd";
import {
  EditOutlined,
  PlusSquareFilled,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { City, Country as CountryInterface } from "@fbs2.0/types";
import { useMediaQuery } from "react-responsive";
import { prepareCity } from "@fbs2.0/utils";

import { ClubsCell } from "../ClubsCell";
import { SubHeader } from "../SubHeader";
import { ClubCV } from "../ClubCV";
import { CountryCV } from "../CountryCV";
import { CityDialog } from "../CityDialog";
import { CombatStats } from "../CombatStats";
import { CvContext } from "../../../../../../context/cvContext";
import { UserContext } from "../../../../../../context/userContext";
import { ResponsivePanel } from "../../../../../../components/ResponsivePanel";
import { useGetCitiesByCountry } from "../../../../../../react-query-hooks/city/useGetCitiesByCountry";
import { Language } from "../../../../../../i18n/locales";

import styles from "./styles.module.scss";
import variables from "../../../../../../style/variables.module.scss";

interface Props {
  country: CountryInterface;
}

const Country: FC<Props> = ({ country }) => {
  const { user } = useContext(UserContext);
  const { cvInput, isPending, setCvInput } = useContext(CvContext);
  const { i18n, t } = useTranslation();
  const cities = useGetCitiesByCountry(country.id);
  const [cityIdToEdit, setCityIdToEdit] = useState<number | null>(null);
  const [combatStatsIsOpen, setCombatStatsIsOpen] = useState(false);

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const columns: TableProps<City>["columns"] = [
    {
      key: "city",
      width: 100,
      className: styles.cell,
      render: (_, city: City) => {
        const { name, name_ua, id } = country.till
          ? prepareCity(city, Number(country.till) - 1)
          : city;

        return (
          <>
            {(i18n.resolvedLanguage === Language.en ? name : name_ua) || name}
            {user?.isEditor && !country.till && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                className={styles["edit-city-button"]}
                onClick={() => setCityIdToEdit(id)}
              />
            )}
          </>
        );
      },
    },
    {
      key: "clubs",
      dataIndex: "clubs",
      className: styles.cell,
      render: (clubs, { id: cityId }) => (
        <ClubsCell clubs={clubs} country={country} cityId={cityId} />
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
        {!country?.till && user?.isEditor && (
          <>
            <Divider type="vertical" />
            <Button
              icon={<TeamOutlined />}
              onClick={() => setCombatStatsIsOpen(true)}
              title={t("clubs.combats.action")}
            >
              {isMdScreen ? t("clubs.combats.action") : ""}
            </Button>
            <Divider type="vertical" />
            <Button
              icon={<PlusSquareFilled />}
              type="primary"
              onClick={() => setCityIdToEdit(-1)}
              title={t("clubs.add_city")}
            >
              {isMdScreen ? t("clubs.add_city") : ""}
            </Button>
          </>
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
            {cvInput?.type === "club" && (
              <ClubCV id={cvInput.id} till={country.till} />
            )}
            {cvInput?.type === "country" && <CountryCV id={cvInput.id} />}
          </>
        </ResponsivePanel>
      </div>
      {cityIdToEdit !== null && user?.isEditor && (
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
      {combatStatsIsOpen && (
        <CombatStats
          country={country}
          open={combatStatsIsOpen}
          onClose={() => setCombatStatsIsOpen(false)}
        />
      )}
    </>
  );
};

export { Country };
