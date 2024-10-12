import {
  ClearOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { StageTableRow } from "@fbs2.0/types";
import { Button, Dropdown } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { MessageInstance } from "antd/es/message/interface";
import { useMediaQuery } from "react-responsive";

import { useDeleteMatch } from "../../../../../../../../../../react-query-hooks/match/useDeleteMatch";
import variables from "../../../../../../../../../../style/variables.module.scss";

interface Props {
  record: StageTableRow;
  messageApi: MessageInstance;
  adding: boolean;
}

const DeleteCell: FC<Props> = ({ record, messageApi }) => {
  const { t } = useTranslation();
  const deleteMatch = useDeleteMatch();
  const { season, tournament } = useParams();

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const removeMatch = async (match: StageTableRow, clearResults: boolean) => {
    try {
      await deleteMatch.mutateAsync({
        matchId: match.id,
        answerMatchId: match.answerMatchId,
        clearResults,
      });

      messageApi.open({
        type: "success",
        content: t(
          `tournament.stages.matches.match.${
            clearResults ? "cleared" : "removed"
          }`,
          {
            season,
            tournament,
          }
        ),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  const items = [
    {
      label: t("common.delete"),
      key: "delete",
      icon: <DeleteOutlined />,
      danger: true,
    },
    {
      label: t("tournament.stages.matches.match.clear"),
      key: "clear",
      icon: <ClearOutlined />,
      disabled: record.results.every(({ date }) => !date),
      danger: true,
    },
  ];

  const onClick = ({ key }: { key: string }) =>
    removeMatch(record, key === "clear");

  return isLgScreen ? (
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
