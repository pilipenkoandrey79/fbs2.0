import { StageSchemeType } from "@fbs2.0/types";
import { Form, Select } from "antd";
import { BaseOptionType } from "antd/es/select";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  name: string | (string | number)[];
  label: string;
  className?: string;
}

const StageSchemeSelector: FC<Props> = ({ name, label, className }) => {
  const { t } = useTranslation();

  const options = Object.values(StageSchemeType).map<BaseOptionType>(
    (value) => ({
      value,
      label: t(`home.tournament.stage.scheme.${value}`),
    })
  );

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: "" }]}
      className={className}
    >
      <Select
        size="small"
        showSearch
        options={options}
        placeholder={t(`common.placeholder.stage_scheme`)}
      />
    </Form.Item>
  );
};

export { StageSchemeSelector };
