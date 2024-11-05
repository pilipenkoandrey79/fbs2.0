import { FC } from "react";
import { Form, SelectProps } from "antd";
import { Country } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { useGetCountries } from "../../../react-query-hooks/country/useGetCountries";
import { Flag } from "../../Flag";
import { Selector } from "../Selector";
import { Language } from "../../../i18n/locales";

interface Props extends SelectProps {
  formItem?: boolean;
  name?: string;
  className?: string;
  year: string | undefined;
}

const CountrySelector: FC<Props> = ({
  formItem = true,
  name = "countryId",
  className,
  value,
  year,
  onChange,
}) => {
  const { i18n, t } = useTranslation();
  const { data } = useGetCountries(year);

  const node = (
    <Selector<Country>
      options={data}
      renderOption={(option) => (
        <span>
          <Flag country={option} />{" "}
          {(i18n.resolvedLanguage === Language.en
            ? option.name
            : option.name_ua) || option.name}
        </span>
      )}
      className={className}
      placeholder={t("common.placeholder.country")}
      {...(formItem ? {} : { value, onChange })}
    />
  );

  return formItem ? (
    <Form.Item name={name} rules={[{ required: true }]}>
      {node}
    </Form.Item>
  ) : (
    node
  );
};

export { CountrySelector };
