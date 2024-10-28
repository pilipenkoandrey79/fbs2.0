import { StageType } from "@fbs2.0/types";
import { Form, Select } from "antd";
import { BaseOptionType } from "antd/es/select";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  name: string | (string | number)[];
  label: string;
  required?: boolean;
  className?: string;
  onChange?: (value: StageType) => void;
}

const StageTypeSelector: FC<Props> = ({
  name,
  label,
  required = true,
  className,
  onChange,
}) => {
  const { t } = useTranslation();

  const options = Object.values(StageType).map<BaseOptionType>((value) => ({
    value,
    label: t(
      `tournament.stage.${value}${
        value === StageType.GROUP || value === StageType.GROUP_2 ? ".short" : ""
      }`
    ),
  }));

  return (
    <Form.Item
      label={label}
      name={name}
      rules={required ? [{ required: true, message: "" }] : undefined}
      className={className}
    >
      <Select
        size="small"
        showSearch
        options={options}
        placeholder={t(`common.placeholder.stage_type`)}
        onChange={onChange}
      />
    </Form.Item>
  );
};

export { StageTypeSelector };
