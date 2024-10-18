import {
  ClearOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { StageTableRow } from "@fbs2.0/types";
import { Button, Dropdown, Popconfirm } from "antd";
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

  const buttons = [
    {
      title: t("common.delete"),
      icon: <DeleteOutlined />,
      key: "delete",
      disabled: false,
    },
    {
      title: t("tournament.stages.matches.match.clear"),
      icon: <ClearOutlined />,
      key: "clear",
      disabled: record.results.every(({ date }) => !date),
    },
  ];

  const items = buttons.map(({ key, title, icon, disabled }) => ({
    label: (
      <Popconfirm
        title={`${title}?`}
        onConfirm={() => removeMatch(record, key === "clear")}
      >
        {icon}
        <span style={{ marginInlineStart: 8 }}>{title}</span>
      </Popconfirm>
    ),
    key,
    danger: true,
    disabled,
  }));

  return isLgScreen || items.length === 1 ? (
    <>
      {buttons.map(({ key, icon, disabled, title }) => (
        <Popconfirm
          title={`${title}?`}
          key={key}
          onConfirm={() => removeMatch(record, key === "clear")}
        >
          <Button
            icon={icon}
            size="small"
            type="link"
            danger
            disabled={disabled}
          />
        </Popconfirm>
      ))}
    </>
  ) : (
    <Dropdown menu={{ items }}>
      <Button type="link" size="small" icon={<EllipsisOutlined />} />
    </Dropdown>
  );
};

export { DeleteCell };
