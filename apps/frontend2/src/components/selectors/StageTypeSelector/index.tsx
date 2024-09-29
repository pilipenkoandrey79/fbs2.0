import { StageType } from "@fbs2.0/types";
import { Form, Select } from "antd";
import { FC } from "react";
import { useParams } from "react-router";
import { BaseOptionType } from "rc-select/lib/Select";
import { useTranslation } from "react-i18next";

import { useGetMatches } from "../../../react-query-hooks/match/useGetMatches";

interface Props {
  name?: string;
  className?: string;
  startingStages?: boolean;
}

const StageTypeSelector: FC<Props> = ({
  name = "stageType",
  className,
  startingStages = false,
}) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const { data } = useGetMatches(season, tournament);

  const options = data?.reduce<BaseOptionType[]>(
    (acc, { stage }) =>
      startingStages && stage.stageScheme.isStarting
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
    <Form.Item name={name} rules={[{ required: true }]}>
      <Select
        size="small"
        showSearch
        options={options}
        className={className}
        placeholder={t(
          `common.placeholder.${startingStages ? "starting_" : ""}stage`
        )}
      />
    </Form.Item>
  );
};

export { StageTypeSelector };
