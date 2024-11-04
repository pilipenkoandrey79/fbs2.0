import { Form, Select } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { BaseOptionType } from "rc-select/lib/Select";
import { isNotEmpty } from "@fbs2.0/utils";

import {
  getCitiesByCountry,
  useGetCities,
} from "../../../react-query-hooks/city/useGetCities";
import { Language } from "../../../i18n/locales";

import styles from "./styles.module.scss";

interface Props {
  countryId?: number;
  name?: string;
  className?: string;
}

const CitySelector: FC<Props> = ({ countryId, name = "cityId", className }) => {
  const { t, i18n } = useTranslation();

  const { data } = useGetCities(
    countryId ? getCitiesByCountry(countryId, i18n.resolvedLanguage) : undefined
  );

  const [isNew, setIsNew] = useState(false);

  return (
    <Form.Item name={name} rules={[{ required: true, message: "" }]}>
      <Select
        size="small"
        mode="tags"
        maxCount={1}
        options={data?.map(({ id, name, name_ua }) => ({
          value: id,
          label:
            (i18n.resolvedLanguage === Language.en ? name : name_ua) || name,
        }))}
        className={classNames(className, { [styles.new]: isNew })}
        placeholder={t("common.placeholder.city")}
        onChange={(_, option) => {
          setIsNew(!isNotEmpty((option as BaseOptionType[])[0].value));
        }}
      />
    </Form.Item>
  );
};

export { CitySelector };
