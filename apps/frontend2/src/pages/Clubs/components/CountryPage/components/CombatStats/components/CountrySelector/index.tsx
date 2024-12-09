import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Country } from "@fbs2.0/types";

import { useGetCountries } from "../../../../../../../../react-query-hooks/country/useGetCountries";
import { Selector } from "../../../../../../../../components/selectors/Selector";
import { Flag } from "../../../../../../../../components/Flag";
import { Language } from "../../../../../../../../i18n/locales";

export interface CountrySelectorProps {
  rival: Country | undefined;
  setRival: (rival: Country | undefined) => void;
}

const CountrySelector: FC<CountrySelectorProps> = ({ rival, setRival }) => {
  const { t, i18n } = useTranslation();
  const { data } = useGetCountries();

  return (
    <Selector<Country>
      options={data}
      allowClear
      renderOption={(option) => (
        <span>
          <Flag country={option} />{" "}
          {(i18n.resolvedLanguage === Language.en
            ? option.name
            : option.name_ua) || option.name}
        </span>
      )}
      placeholder={t("common.placeholder.country")}
      value={rival?.id}
      onClear={() => setRival(undefined)}
      onChange={(value) => setRival(data?.find(({ id }) => id === value))}
    />
  );
};

export { CountrySelector };
