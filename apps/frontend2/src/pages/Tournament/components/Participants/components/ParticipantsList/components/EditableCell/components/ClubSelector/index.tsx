import { Form, Select } from "antd";
import { FC } from "react";
import { useParams } from "react-router";
import { Participant } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import {
  getYearSelector,
  useGetClubs,
} from "../../../../../../../../../../react-query-hooks/club/useGetClubs";
import { useGetParticipants } from "../../../../../../../../../../react-query-hooks/participant/useGetParticipants";
import { Club } from "../../../../../../../../../../components/Club";

interface Props {
  name: string;
  record: Participant | undefined;
}

const ClubSelector: FC<Props> = ({ name, record }) => {
  const { i18n } = useTranslation();
  const { season, tournament } = useParams();
  const { data: clubs } = useGetClubs(getYearSelector(season?.split("-")?.[0]));

  const { data: usedClubIds } = useGetParticipants<number[]>(
    season,
    tournament,
    (data: Participant[]) => data.map(({ club }) => club.id)
  );

  const collator = new Intl.Collator(i18n.resolvedLanguage);

  const options = clubs
    ?.filter(
      ({ id, city }) =>
        (!(usedClubIds as unknown as number[])?.includes(id) ||
          id === record?.club.id) &&
        city.country.id === record?.club.city.country.id
    )
    .sort((a, b) => collator.compare(a.name, b.name));

  return (
    <Form.Item name={name} rules={[{ required: true }]} style={{ margin: 0 }}>
      <Select
        size="small"
        showSearch
        filterOption={(input, option) =>
          (option?.["data-label"] ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        style={{ width: "80%" }}
      >
        {options?.map((option) => (
          <Select.Option
            key={option.id}
            value={option.id}
            data-label={option.name}
          >
            <Club club={option} />
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export { ClubSelector };
