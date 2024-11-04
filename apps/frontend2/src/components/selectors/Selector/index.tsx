import { Select, SelectProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Language } from "../../../i18n/locales";

interface Props<T> extends Omit<SelectProps, "options"> {
  options: T[] | undefined;
  renderOption: (option: T) => ReactNode;
}

const Selector = <T extends AnyObject>({
  options,
  renderOption,
  ...rest
}: Props<T>) => {
  const { i18n } = useTranslation();

  return (
    <Select
      size="small"
      showSearch
      filterOption={(input, option) =>
        (option?.["data-label"] ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      {...rest}
    >
      {options?.map((option) => (
        <Select.Option
          key={option.id}
          value={option.id}
          data-label={
            (i18n.resolvedLanguage === Language.en
              ? option.name
              : option.name_ua) || option.name
          }
        >
          {renderOption(option)}
        </Select.Option>
      ))}
    </Select>
  );
};

export { Selector };
