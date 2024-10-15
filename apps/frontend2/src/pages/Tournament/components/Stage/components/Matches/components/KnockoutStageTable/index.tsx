import {
  ClubWithWinner,
  Group,
  GROUP_STAGES,
  MatchDto,
  Participant,
  Stage,
  StageSchemeType,
  StageTableRow,
  TournamentStage,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import { Button, Form, Table, TableProps } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";
import { MessageInstance } from "antd/es/message/interface";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { EditableCell, EditableCellProps } from "./components/EditableCell";
import { ResultsCell } from "./components/ResultsCell";
import { Result, ResultForm } from "./components/ResultForm";
import { DeleteCell } from "./components/DeleteCell";
import { UserContext } from "../../../../../../../../context/userContext";
import { Club } from "../../../../../../../../components/Club";
import { useCreateMatch } from "../../../../../../../../react-query-hooks/match/useCreateMatch";
import { getFilteredParticipants } from "../../../../utils";

import variables from "../../../../../../../../style/variables.module.scss";
import styles from "./styles.module.scss";

const templateRow = {
  id: -1,
  host: {} as ClubWithWinner,
  guest: {} as ClubWithWinner,
  results: [],
};

interface Props {
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[] | undefined;
  };
  matches: TournamentStage;
  stage: Stage;
  highlightedClubId: number | null;
  messageApi: MessageInstance;
  loading: boolean;
  tour: number | undefined;
  group: Group | undefined;
}

const KnockoutStageTable: FC<Props> = ({
  matches,
  stage,
  highlightedClubId,
  participants,
  messageApi,
  loading,
  tour,
  group,
}) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const [form] = Form.useForm<MatchDto>();
  const { user } = useContext(UserContext);
  const createMatch = useCreateMatch();

  const [dataSource, setDataSource] = useState<StageTableRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [addMore, setAddMore] = useState(true);
  const [resultEditing, setResultEditing] = useState<Result | null>(null);

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const availableParticipants = useMemo(
    () =>
      getFilteredParticipants(
        participants.seeded,
        participants.previousStageWinners,
        participants.skippers,
        { stage, matches },
        group,
        tour
      ),
    [
      group,
      matches,
      participants.previousStageWinners,
      participants.seeded,
      participants.skippers,
      stage,
      tour,
    ]
  );

  const availableDates = [
    ...new Set(
      dataSource
        ?.map(({ results }) => results)
        .flat()
        .map(({ date }) => date)
    ),
  ];

  const getTeamColumn = (key: "host" | "guest") => ({
    key,
    dataIndex: key,
    width: isLgScreen ? 200 : 100,
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
              isNotEmpty(stage.linkedTournament) && !team?.isWinner,
            [styles[`highlighted-${stage.tournamentSeason.tournament}`]]:
              team.club.id === highlightedClubId,
          })}
        />
      ) : null,
    onCell: (record: StageTableRow) =>
      ({
        dataIndex: `${key}Id`,
        ...(record.id === templateRow.id
          ? {
              editing: true,
              participants: availableParticipants,
              form,
              loading: createMatch.isPending,
            }
          : { editing: false }),
      } as EditableCellProps),
  });

  const columns: TableProps<StageTableRow>["columns"] = [
    ...(dataSource?.length > 5
      ? [
          {
            key: "no",
            rowScope: "row",
            width: 20,
            className: styles.number,
            render: (_: never, __: never, index: number) => index + 1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        ]
      : []),
    getTeamColumn("host"),
    {
      key: "results",
      dataIndex: "results",
      width: 100,
      className: styles["results-cell"],
      render: (results: StageTableRow["results"], record: StageTableRow) => (
        <ResultsCell
          results={results}
          forceWinnerId={record.forceWinnerId}
          host={record.host}
          guest={record.guest}
          adding={adding}
          stageSchemeType={stage.stageScheme.type}
          onEdit={(date: string) => {
            setResultEditing({ match: record, date });
          }}
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
    ...(user?.isEditor
      ? [
          {
            key: "delete",
            width: isLgScreen ? 60 : 26,
            className: styles.delete,
            render: (record: StageTableRow) =>
              record.id === templateRow.id ? null : (
                <DeleteCell
                  record={record}
                  messageApi={messageApi}
                  adding={adding}
                  isKnockoutStage={
                    ![...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
                      stage.stageScheme.type
                    )
                  }
                />
              ),
          },
        ]
      : []),
  ];

  const addMatch = async (values: MatchDto) => {
    try {
      await createMatch.mutateAsync({
        ...values,
        stageType: stage.stageType,
        answer: false,
        tour,
        group,
      });

      if (addMore) {
        form.resetFields();
      } else {
        setAdding(false);
      }

      messageApi.open({
        type: "success",
        content: t("tournament.stages.matches.match.added", {
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
    if (adding && availableParticipants.length < 1) {
      setAdding(false);
    }
  }, [adding, availableParticipants.length]);

  useEffect(() => {
    setDataSource(
      adding
        ? [
            ...(matches?.[group as Group]?.tours?.[tour || 1] || []),
            { ...templateRow, tour, group },
          ]
        : matches?.[group as Group]?.tours?.[tour || 1]
    );
  }, [adding, group, matches, tour]);

  return (
    <>
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
          loading={loading}
        />
      </Form>
      {user?.isEditor && availableParticipants.length > 0 && (
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
      {!!resultEditing && (
        <ResultForm
          row={resultEditing}
          stage={stage}
          onClose={() => setResultEditing(null)}
          messageApi={messageApi}
          availableDates={availableDates}
        />
      )}
    </>
  );
};

export { KnockoutStageTable };
