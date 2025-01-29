import { Form, Select } from "antd";
import { FC } from "react";
import { FieldProps } from "rc-field-form/lib/Field";
import { useTranslation } from "react-i18next";
import { Participant } from "@fbs2.0/types";

import { Club } from "../../../../../../../../../../../../components/Club";
import {
  BCP47Locales,
  Language,
} from "../../../../../../../../../../../../i18n/locales";

interface Props {
  name: FieldProps["name"];
  participants?: Participant[];
}

const TeamCell: FC<Props> = ({ name, participants }) => {
  const { t, i18n } = useTranslation();

  const collator = new Intl.Collator(
    BCP47Locales[i18n.resolvedLanguage as Language],
  );

  const options = participants?.sort((a, b) =>
    collator.compare(
      (i18n.resolvedLanguage === Language.en ? a.club.name : a.club.name_ua) ||
        a.club.name,
      (i18n.resolvedLanguage === Language.en ? b.club.name : b.club.name_ua) ||
        b.club.name,
    ),
  );

  return (
    <td>
      <Form.Item
        name={name}
        rules={[{ required: true, message: t("common.placeholder.club") }]}
      >
        <Select
          size="small"
          showSearch
          filterOption={(input, option) =>
            (option?.["data-label"] ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          allowClear
          placeholder={t("common.placeholder.club")}
        >
          {options?.map((option) => (
            <Select.Option
              key={option.id}
              value={option.id}
              data-label={option.club.name}
            >
              <Club club={option.club} to={false} />
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </td>
  );
};

export { TeamCell };
