import { Form, Select } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import {
  getCitiesByCountry,
  useGetCities,
} from "../../../react-query-hooks/city/useGetCities";

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

  return (
    <Form.Item name={name} rules={[{ required: true }]}>
      <Select
        size="small"
        showSearch
        options={data?.map(({ id, name }) => ({ value: id, label: name }))}
        className={className}
        placeholder={t("common.placeholder.city")}
      />
    </Form.Item>
  );
};

export { CitySelector };
