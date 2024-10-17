import {
  ClearOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { StageTableRow } from "@fbs2.0/types";
import { Button, Dropdown } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import { useDeleteMatch } from "../../../../../../../../../../react-query-hooks/match/useDeleteMatch";
import variables from "../../../../../../../../../../style/variables.module.scss";

interface Props {
  record: StageTableRow;
  adding: boolean;
  isKnockoutStage: boolean;
}

const DeleteCell: FC<Props> = ({ record, isKnockoutStage }) => {
  const { t } = useTranslation();
  const deleteMatch = useDeleteMatch();

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const removeMatch = async (match: StageTableRow, clearResults: boolean) => {
    await deleteMatch.mutateAsync({
      matchId: match.id,
      answerMatchId: match.answerMatchId,
      clearResults,
    });
  };

  const items = [
    {
      label: t("common.delete"),
      key: "delete",
      icon: <DeleteOutlined />,
      danger: true,
    },
    ...(isKnockoutStage
      ? [
          {
            label: t("tournament.stages.matches.match.clear"),
            key: "clear",
            icon: <ClearOutlined />,
            disabled: record.results.every(({ date }) => !date),
            danger: true,
          },
        ]
      : []),
  ];

  const onClick = ({ key }: { key: string }) =>
    removeMatch(record, key === "clear");

  return isLgScreen || items.length === 1 ? (
    <>
      {items.map(({ key, icon, danger, disabled }) => (
        <Button
          key={key}
          icon={icon}
          size="small"
          type="link"
          danger={danger}
          disabled={disabled}
          onClick={() => onClick({ key })}
        />
      ))}
    </>
  ) : (
    <Dropdown menu={{ items, onClick }}>
      <Button type="link" size="small" icon={<EllipsisOutlined />} />
    </Dropdown>
  );
};

export { DeleteCell };
