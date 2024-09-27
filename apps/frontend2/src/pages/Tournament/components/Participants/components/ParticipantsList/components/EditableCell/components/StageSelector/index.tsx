import { StageType } from "@fbs2.0/types";
import { Form, Select } from "antd";
import { FC } from "react";
import { useParams } from "react-router";
import { BaseOptionType } from "rc-select/lib/Select";
import { useTranslation } from "react-i18next";

import { useGetMatches } from "../../../../../../../../../../react-query-hooks/match/useGetMatches";

interface Props {
  name: string;
}

const StageSelector: FC<Props> = ({ name }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const { data } = useGetMatches(season, tournament);

  const options = data?.reduce<BaseOptionType[]>(
    (acc, { stage }) =>
      stage.stageScheme.isStarting
        ? [
            ...acc,
            {
              value: stage.stageType,
              label: t(
                `tournament.stage.${stage.stageType}${
                  stage.stageType === StageType.GROUP ||
                  stage.stageType === StageType.GROUP_2
                    ? ".short"
                    : ""
                }`
              ),
            },
          ]
        : acc,
    []
  );

  return (
    <Form.Item name={name} rules={[{ required: true }]} style={{ margin: 0 }}>
      <Select
        size="small"
        showSearch
        style={{ width: "80%" }}
        options={options}
      />
    </Form.Item>
  );
};

export { StageSelector };
