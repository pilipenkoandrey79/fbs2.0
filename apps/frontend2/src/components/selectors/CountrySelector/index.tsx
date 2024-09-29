import { FC } from "react";
import { Form, Select, SelectProps } from "antd";
import { Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { useGetCountries } from "../../../react-query-hooks/country/useGetCountries";
import { Flag } from "../../Flag";

interface OldCountriesConfigProp {
  disable?: boolean;
  toTop?: boolean;
}

interface Props extends SelectProps {
  formItem?: boolean;
  name?: string;
  className?: string;
  oldCountriesConfig?: OldCountriesConfigProp;
}

const getOptions = (
  countries: Country[] | undefined,
  config: OldCountriesConfigProp | undefined,
  locale: string | undefined
) => {
  if (!config?.toTop) {
    return countries;
  }

  const { old, current } = (countries || []).reduce<{
    old: Country[];
    current: Country[];
  }>(
    (acc, country) => {
      if (isNotEmpty(country.till)) {
        acc.old.push(country);
      } else {
        acc.current.push(country);
      }

      return acc;
    },
    { old: [], current: [] }
  );

  const collator = new Intl.Collator(locale);

  return [
    ...old.sort((a, b) => collator.compare(a.name, b.name)),
    ...current.sort((a, b) => collator.compare(a.name, b.name)),
  ];
};

const CountrySelector: FC<Props> = ({
  formItem = true,
  name = "countryId",
  className,
  oldCountriesConfig,
  value,
  onChange,
}) => {
  const { i18n, t } = useTranslation();
  const { data } = useGetCountries();

  const node = (
    <Select
      size="small"
      showSearch
      filterOption={(input, option) =>
        (option?.["data-label"] ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      className={className}
      placeholder={t("common.placeholder.country")}
      {...(formItem
        ? {}
        : {
            value,
            onChange,
          })}
    >
      {getOptions(data, oldCountriesConfig, i18n.resolvedLanguage)?.map(
        (option) => (
          <Select.Option
            key={option.id}
            value={option.id}
            data-label={option.name}
            disabled={oldCountriesConfig?.disable && option.till}
          >
            <span>
              <Flag country={option} /> {option.name}
            </span>
          </Select.Option>
        )
      )}
    </Select>
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
