import { DATE_FORMAT } from "@fbs2.0/types";
import { formatDatePickerValue, normalizeDatePickerValue } from "@fbs2.0/utils";
import { DatePicker, DatePickerProps, Form, FormItemProps } from "antd";
import { FC } from "react";
import dayjs from "dayjs";
import { SizeType } from "antd/es/config-provider/SizeContext";

interface Props extends FormItemProps {
  availableDates?: string[];
  size?: SizeType;
  required?: boolean;
}

const DateInput: FC<Props> = ({
  availableDates,
  size,
  required = true,
  ...restProps
}) => {
  const presets: DatePickerProps["presets"] = availableDates
    ?.map((label) => ({
      label,
      value: formatDatePickerValue(label) as dayjs.Dayjs,
    }))
    .filter(({ value }) => value !== null);

  return (
    <Form.Item
      rules={[{ required, message: "" }]}
      getValueProps={(value) => ({ value: formatDatePickerValue(value) })}
      normalize={(value) => normalizeDatePickerValue(value)}
      {...restProps}
    >
      <DatePicker
        format={DATE_FORMAT}
        presets={presets}
        size={size || "middle"}
        placement="bottomLeft"
      />
    </Form.Item>
  );
};

export { DateInput };
