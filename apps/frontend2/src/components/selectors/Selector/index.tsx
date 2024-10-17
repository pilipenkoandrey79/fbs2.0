import { Select, SelectProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { ReactNode } from "react";

interface Props<T> extends Omit<SelectProps, "options"> {
  options: T[] | undefined;
  renderOption: (option: T) => ReactNode;
}

const Selector = <T extends AnyObject>({
  options,
  renderOption,
  ...rest
}: Props<T>) => (
  <Select
    size="small"
    showSearch
    filterOption={(input, option) =>
      (option?.["data-label"] ?? "").toLowerCase().includes(input.toLowerCase())
    }
    {...rest}
  >
    {options?.map((option) => (
      <Select.Option key={option.id} value={option.id} data-label={option.name}>
        {renderOption(option)}
      </Select.Option>
    ))}
  </Select>
);

export { Selector };
