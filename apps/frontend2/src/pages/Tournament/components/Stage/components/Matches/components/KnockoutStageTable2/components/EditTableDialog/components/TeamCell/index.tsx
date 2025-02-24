import { Form, FormInstance, Select } from "antd";
import { FC } from "react";
import { FieldProps } from "rc-field-form/lib/Field";
import { useTranslation } from "react-i18next";
import { Participant } from "@fbs2.0/types";

import { Club } from "../../../../../../../../../../../../components/Club";
import {
  BCP47Locales,
  Language,
} from "../../../../../../../../../../../../i18n/locales";
import { MatchesDto } from "../..";

interface Props {
  name: FieldProps["name"];
  form: FormInstance<MatchesDto>;
  participants?: Participant[];
}

const TeamCell: FC<Props> = ({ name, participants, form }) => {
  const { t, i18n } = useTranslation();

  const collator = new Intl.Collator(
    BCP47Locales[i18n.resolvedLanguage as Language],
  );

  const selectedIds = Form.useWatch(["matches"], form)
    ?.reduce<number[]>((acc, row) => [...acc, row?.host.id, row?.guest.id], [])
    .filter(
      (id) =>
        id !==
        form.getFieldValue([
          "matches",
          ...(name as [number, "host" | "guest"]),
          "id",
        ]),
    );

  const options = participants
    ?.sort((a, b) =>
      collator.compare(
        (i18n.resolvedLanguage === Language.en
          ? a.club?.name
          : a?.club?.name_ua) || a?.club?.name,
        (i18n.resolvedLanguage === Language.en
          ? b.club?.name
          : b?.club?.name_ua) || b?.club?.name,
      ),
    )
    .filter((participant) => !(selectedIds ?? []).includes(participant?.id));

  return (
    <td>
      <Form.Item
        name={name}
        rules={[{ required: true, message: t("common.placeholder.club") }]}
        getValueProps={(team) => ({ value: team?.id })}
        normalize={(id) => options?.find((team) => team?.id === id)}
      >
        <Select
          size="small"
          showSearch
          filterOption={(input, option) =>
            (option?.["data-label"] ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          placeholder={t("common.placeholder.club")}
        >
          {options?.map((option) => (
            <Select.Option
              key={option?.id}
              value={option?.id}
              data-label={option?.club?.name}
            >
              <Club club={option?.club} to={false} />
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </td>
  );
};

export { TeamCell };
