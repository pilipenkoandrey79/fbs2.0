import { FC, useContext, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Button, Divider, Table, TableProps } from "antd";
import {
  EditOutlined,
  PlusSquareFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import { City, CV_SEARCH_PARAMETER } from "@fbs2.0/types";
import { createSearchParams, useSearchParams } from "react-router-dom";

import { ClubsCell } from "../ClubsCell";
import { SubHeader } from "../SubHeader";
import { ClubCV } from "../ClubCV";
import { CountryCV } from "../CountryCV";
import { CityDialog } from "../CityDialog";
import { CvContext } from "../../../../../../context/cvContext";
import { ResponsivePanel } from "../../../../../../components/ResponsivePanel";
import { useGetCountries } from "../../../../../../react-query-hooks/country/useGetCountries";
import { useGetCitiesByCountry } from "../../../../../../react-query-hooks/city/useGetCitiesByCountry";
import { Language } from "../../../../../../i18n/locales";
import { Paths } from "../../../../../../routes";

import styles from "./styles.module.scss";

export type CVInput = { type: "club" | "country"; id: number | undefined };

const Country: FC = () => {
  const { cvValue, setCvValue } = useContext(CvContext);
  const { i18n, t } = useTranslation();
  const { code } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const countries = useGetCountries();
  const country = countries.data?.find((country) => country.code === code);
  const cities = useGetCitiesByCountry(country?.id);
  const [isPending, startTransition] = useTransition();

  const [cvInput, setCvInput] = useState<CVInput | null>(null);
  const [cityIdToEdit, setCityIdToEdit] = useState<number | null>(null);

  const cvSearchParameter = searchParams.get(CV_SEARCH_PARAMETER);

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
        <ClubsCell
          clubs={clubs}
          cvInput={cvInput}
          setCvInput={(input) =>
            startTransition(() => {
              setCvInput(input);
            })
          }
          countryId={country?.id}
          cityId={cityId}
        />
      ),
    },
  ];

  useEffect(() => {
    if (countries.isSuccess && !country) {
      navigate(Paths.CLUBS);
    }
  }, [countries.isSuccess, country, navigate]);

  useEffect(() => {
    if (!country?.id) {
      return;
    }

    if (
      cvInput === null &&
      cvSearchParameter?.match(/(country|club)(-(\d+))?/)
    ) {
      const cvSearchParameterParts = cvSearchParameter.split("-");
      const type = cvSearchParameterParts[0] as CVInput["type"];

      const id =
        type === "country" ? country?.id : Number(cvSearchParameterParts[1]);

      setCvInput({ type, id });
    }
  }, [country?.id, cvInput, cvSearchParameter]);

  useEffect(() => {
    if (!country?.id) {
      return;
    }

    const newCvSearchParameter = cvInput
      ? `${cvInput.type}${cvInput.type === "club" ? `-${cvInput.id}` : ""}`
      : null;

    if (cvSearchParameter !== newCvSearchParameter) {
      setSearchParams(
        createSearchParams(
          newCvSearchParameter
            ? [[CV_SEARCH_PARAMETER, newCvSearchParameter]]
            : []
        )
      );
    }
  }, [country?.id, cvInput, cvSearchParameter, setSearchParams]);

  return (
    <>
      <SubHeader country={country}>
        <Button
          icon={<TrophyOutlined />}
          onClick={() =>
            startTransition(() => {
              setCvInput({ type: "country", id: country?.id });
            })
          }
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
            setSearchParams(createSearchParams([]));
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
