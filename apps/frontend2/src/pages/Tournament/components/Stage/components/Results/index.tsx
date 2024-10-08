import {
  ClubWithWinner,
  MatchDto,
  Participant,
  StageTableRow,
  TournamentDataRow,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { Button, Form, message, Popconfirm, Table, TableProps } from "antd";
import { FC, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useParams } from "react-router";

import { UserContext } from "../../../../../../context/userContext";
import { Club } from "../../../../../../components/Club";
import { ResultsCell } from "./components/ResultsCell";
import { EditableCell, EditableCellProps } from "./components/EditableCell";
import { useCreateMatch } from "../../../../../../react-query-hooks/match/useCreateMatch";
import { useDeleteMatch } from "../../../../../../react-query-hooks/match/useDeleteMatch";

import styles from "./styles.module.scss";
import variables from "../../../../../../style/variables.module.scss";

const templateRow = {
  id: -1,
  host: {} as ClubWithWinner,
  guest: {} as ClubWithWinner,
  results: [],
};

interface Props {
  visible: boolean;
  participants: Participant[];
  tournamentPart: TournamentDataRow;
  highlightedClubId: number | null;
}

const Results: FC<Props> = ({
  visible,
  tournamentPart,
  highlightedClubId,
  participants,
}) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [form] = Form.useForm<MatchDto>();
  const { season, tournament } = useParams();
  const createMatch = useCreateMatch();
  const deleteMatch = useDeleteMatch();
  const [messageApi, contextHolder] = message.useMessage();
  const [adding, setAdding] = useState(false);
  const [addMore, setAddMore] = useState(true);
  const [dataSource, setDataSource] = useState<StageTableRow[]>([]);

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const getTeamColumn = (key: "host" | "guest") => ({
    key,
    dataIndex: key,
    width: 120,
    ellipsis: true,
    render: (team: StageTableRow["host"] | StageTableRow["guest"]) =>
      team.club ? (
        <Club
          club={team.club}
          showCity={isLgScreen}
          className={classNames(styles.club, {
            [styles.winner]: team?.isWinner,
            [styles.mine]: [UKRAINE, USSR].includes(
              team.club.city.country.name
            ),
            [styles.relegated]:
              isNotEmpty(tournamentPart.stage.linkedTournament) &&
              !team?.isWinner,
            [styles[
              `highlighted-${tournamentPart.stage.tournamentSeason.tournament}`
            ]]: team.club.id === highlightedClubId,
          })}
        />
      ) : null,
    onCell: (record: StageTableRow) =>
      ({
        dataIndex: `${key}Id`,
        ...(record.id === templateRow.id
          ? {
              editing: true,
              participants,
              form,
              loading: createMatch.isPending,
            }
          : { editing: false }),
      } as EditableCellProps),
  });

  const columns: TableProps<StageTableRow>["columns"] = [
    getTeamColumn("host"),
    {
      key: "results",
      dataIndex: "results",
      width: 100,
      className: styles["results-cell"],
      render: (
        results: StageTableRow["results"],
        { forceWinnerId, host, guest }
      ) => (
        <ResultsCell
          results={results}
          forceWinnerId={forceWinnerId}
          host={host}
          guest={guest}
          adding={adding}
        />
      ),
      onCell: (record: StageTableRow) =>
        ({
          dataIndex: "results",
          ...(record.id === templateRow.id
            ? {
                editing: true,
                form,
                addMore,
                setAddMore,
                loading: createMatch.isPending,
              }
            : { editing: false }),
        } as EditableCellProps),
    },
    getTeamColumn("guest"),
    {
      key: "delete",
      width: 30,
      className: styles.delete,
      render: (record: StageTableRow) => (
        <Popconfirm
          title={t("common.remove")}
          description={t("tournament.stages.results.match.remove_confirm")}
          onConfirm={() => removeMatch(record)}
        >
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined />}
            disabled={adding}
          />
        </Popconfirm>
      ),
    },
  ];

  const addMatch = async (values: MatchDto) => {
    try {
      await createMatch.mutateAsync({
        ...values,
        stageType: tournamentPart.stage.stageType,
        answer: false,
      });

      if (addMore) {
        form.resetFields();
      } else {
        setAdding(false);
      }

      messageApi.open({
        type: "success",
        content: t("tournament.stages.results.match.added", {
          season,
          tournament,
        }),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  const removeMatch = async (match: StageTableRow) => {
    try {
      await deleteMatch.mutateAsync({
        matchId: match.id,
        answerMatchId: match.answerMatchId,
      });

      messageApi.open({
        type: "success",
        content: t("tournament.stages.results.match.removed", {
          season,
          tournament,
        }),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  useEffect(() => {
    if (adding && participants.length < 1) {
      setAdding(false);
    }
  }, [adding, participants.length]);

  useEffect(() => {
    setDataSource(
      adding
        ? [...(tournamentPart.matches as StageTableRow[]), templateRow]
        : (tournamentPart.matches as StageTableRow[])
    );
  }, [adding, tournamentPart.matches]);

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.matches}
    >
      {contextHolder}
      <h3>{`${t("tournament.stages.results.title")}`}</h3>
      <Form form={form} onFinish={addMatch}>
        <Table<StageTableRow>
          components={{ body: { cell: EditableCell } }}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          size="small"
          pagination={false}
          showHeader={false}
          bordered
        />
      </Form>
      {user?.isEditor && participants.length > 0 && (
        <Button
          icon={adding ? <CloseOutlined /> : <PlusOutlined />}
          type="primary"
          size="small"
          onClick={() => {
            if (adding) {
              form.resetFields();
            }

            setAdding(!adding);
          }}
          disabled={createMatch.isPending}
        />
      )}
    </div>
  );
};

export { Results };
