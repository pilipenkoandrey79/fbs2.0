import { DATE_FORMAT } from "@fbs2.0/types";
import { formatDatePickerValue, normalizeDatePickerValue } from "@fbs2.0/utils";
import { DatePicker, Form } from "antd";
import { FC } from "react";

interface Props {
  name: string;
  label?: string;
}

const DateInput: FC<Props> = ({ name, label }) => (
  <Form.Item
    name={name}
    label={label}
    rules={[{ required: true, message: "" }]}
    getValueProps={(value) => ({ value: formatDatePickerValue(value) })}
    normalize={(value) => normalizeDatePickerValue(value)}
  >
    <DatePicker format={DATE_FORMAT} />
  </Form.Item>
);

export { DateInput };
