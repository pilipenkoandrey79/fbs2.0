import { DATE_FORMAT } from "@fbs2.0/types";
import { formatDatePickerValue, normalizeDatePickerValue } from "@fbs2.0/utils";
import { DatePicker, DatePickerProps, Form } from "antd";
import { FC } from "react";
import dayjs from "dayjs";

interface Props {
  name: string;
  label?: string;
  availableDates?: string[];
}

const DateInput: FC<Props> = ({ name, label, availableDates }) => {
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
      <DatePicker format={DATE_FORMAT} presets={presets} />
    </Form.Item>
  );
};

export { DateInput };
