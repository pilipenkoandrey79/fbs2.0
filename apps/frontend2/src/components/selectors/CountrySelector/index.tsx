import { FC } from "react";
import { Form, SelectProps } from "antd";
import { Country } from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { useGetCountries } from "../../../react-query-hooks/country/useGetCountries";
import { Flag } from "../../Flag";
import { Selector } from "../Selector";
import { BCP47Locales, Language } from "../../../i18n/locales";

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
  resolvedLanguage: string | undefined
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

  const collator = new Intl.Collator(
    BCP47Locales[resolvedLanguage as Language]
  );

  return [
    ...old.sort((a, b) =>
      collator.compare(
        (resolvedLanguage === Language.en ? a.name : a.name_ua) || a.name,
        (resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name
      )
    ),
    ...current.sort((a, b) =>
      collator.compare(
        (resolvedLanguage === Language.en ? a.name : a.name_ua) || a.name,
        (resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name
      )
    ),
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
    <Selector<Country>
      options={getOptions(data, oldCountriesConfig, i18n.resolvedLanguage)}
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
