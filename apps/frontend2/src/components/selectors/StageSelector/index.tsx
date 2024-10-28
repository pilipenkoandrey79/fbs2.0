import { StageType, Tournament } from "@fbs2.0/types";
import { Form, Select } from "antd";
import { FC } from "react";
import { useParams } from "react-router";
import { BaseOptionType } from "rc-select/lib/Select";
import { useTranslation } from "react-i18next";

import { useGetTournamentStages } from "../../../react-query-hooks/tournament/useGetTournamentStages";

interface Props {
  name?: string | (string | number)[];
  className?: string;
  startingStages?: boolean;
}

const StageSelector: FC<Props> = ({
  name = "stageType",
  className,
  startingStages = false,
}) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const { data } = useGetTournamentStages(season, tournament as Tournament);

  const options = data?.reduce<BaseOptionType[]>(
    (acc, { stageScheme, stageType }) =>
      startingStages && stageScheme.isStarting
        ? [
            ...acc,
            {
              value: stageType,
              label: t(
                `tournament.stage.${stageType}${
                  stageType === StageType.GROUP ||
                  stageType === StageType.GROUP_2
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

export { StageSelector };
