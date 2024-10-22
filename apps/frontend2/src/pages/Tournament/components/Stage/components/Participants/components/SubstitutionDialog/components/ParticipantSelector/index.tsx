import { Participant } from "@fbs2.0/types";
import { Form } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { Selector } from "../../../../../../../../../../components/selectors/Selector";
import { Club } from "../../../../../../../../../../components/Club";

interface Props {
  name: string;
  label: string;
  options: Participant[] | undefined;
}

const ParticipantSelector: FC<Props> = ({ name, label, options }) => {
  const { t } = useTranslation();

  return (
    <Form.Item name={name} label={label} rules={[{ required: true }]}>
      <Selector<Participant>
        allowClear
        placeholder={t("common.placeholder.club")}
        disabled={(options?.length || 0) < 1}
        options={options}
        renderOption={(option) => <Club club={option.club} />}
      />
    </Form.Item>
  );
};

export { ParticipantSelector };
