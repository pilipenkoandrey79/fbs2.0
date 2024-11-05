import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Button, Divider, Drawer, Table, TableProps } from "antd";
import { useMediaQuery } from "react-responsive";
import {
  CloseOutlined,
  PlusSquareFilled,
  TrophyOutlined,
} from "@ant-design/icons";

import { SubHeader } from "./components/SubHeader";
import { ClubsCell } from "./components/ClubsCell";
import { CV, CVInput } from "./components/CV";
import { useGetCountries } from "../../../../react-query-hooks/country/useGetCountries";
import {
  ClubsByCity,
  getByCitySelector,
  useGetClubs,
} from "../../../../react-query-hooks/club/useGetClubs";
import { Paths } from "../../../../routes";
import { Language } from "../../../../i18n/locales";

import styles from "./styles.module.scss";
import variables from "../../../../style/variables.module.scss";

const Country: FC = () => {
  const { i18n, t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const countries = useGetCountries();
  const country = countries.data?.find((country) => country.code === code);

  const clubs = useGetClubs<ClubsByCity[]>(
    country?.id,
    getByCitySelector(i18n.resolvedLanguage as Language),
    countries.isSuccess
  );

  const isMdScreen = useMediaQuery({
    query: `(min-width: ${variables.screenMd})`,
  });

  const [cvInput, setCvInput] = useState<CVInput | null>(null);

  const columns: TableProps<ClubsByCity>["columns"] = [
    {
      key: "city",
      dataIndex: "city",
      width: 100,
      render: ({ name, name_ua }) =>
        (i18n.resolvedLanguage === Language.en ? name : name_ua) || name,
    },
    {
      key: "clubs",
      dataIndex: "clubs",
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
        <Button icon={<PlusSquareFilled />} type="primary">
          {t("clubs.add_city")}
        </Button>
      </SubHeader>
      <div className={styles.container}>
        <div className={styles.table}>
          <Table<ClubsByCity>
            columns={columns}
            dataSource={clubs.data}
            rowKey="id"
            size="small"
            pagination={false}
            showHeader={false}
            bordered
          />
        </div>
        {isMdScreen ? (
          cvInput !== null ? (
            <div className={styles.cv}>
              <Button
                icon={<CloseOutlined />}
                type="text"
                className={styles["close-button"]}
                onClick={() => setCvInput(null)}
              />
              <CV input={cvInput} />
            </div>
          ) : null
        ) : (
          <Drawer
            open={cvInput !== null}
            onClose={() => setCvInput(null)}
            maskClosable={false}
            title="CV"
          >
            <CV input={cvInput} />
          </Drawer>
        )}
      </div>
    </>
  );
};

export { Country };
