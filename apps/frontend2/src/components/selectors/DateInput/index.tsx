import { DATE_FORMAT } from "@fbs2.0/types";
import { formatDatePickerValue, normalizeDatePickerValue } from "@fbs2.0/utils";
import { DatePicker, DatePickerProps, Form } from "antd";
import { FC } from "react";
import dayjs from "dayjs";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { NamePath } from "antd/es/form/interface";

interface Props {
  name: NamePath;
  label?: string;
  availableDates?: string[];
  size?: SizeType;
}

const DateInput: FC<Props> = ({ name, label, availableDates, size }) => {
  const presets: DatePickerProps["presets"] = availableDates
    ?.map((label) => ({
      label,
      value: formatDatePickerValue(label) as dayjs.Dayjs,
    }))
    .filter(({ value }) => value !== null);

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required: true, message: "" }]}
      getValueProps={(value) => ({ value: formatDatePickerValue(value) })}
      normalize={(value) => normalizeDatePickerValue(value)}
    >
      <DatePicker
        format={DATE_FORMAT}
        presets={presets}
        size={size || "middle"}
      />
    </Form.Item>
  );
};

export { DateInput };
