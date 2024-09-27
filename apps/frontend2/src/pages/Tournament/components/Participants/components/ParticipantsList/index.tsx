import { Participant, StageType } from "@fbs2.0/types";
import { Button, Form, message, Table, TableProps, Typography } from "antd";
import { FilterValue, TablePaginationConfig } from "antd/es/table/interface";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTournamentTitle } from "@fbs2.0/utils";
import { useParams } from "react-router";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";

import { Flag } from "../../../../../../components/Flag";
import { Club } from "../../../../../../components/Club";
import { EditableCell, EditableCellProps } from "./components/EditableCell";
import {
  getYearSelector,
  useGetCountries,
} from "../../../../../../react-query-hooks/country/useGetCountries";
import { useUpdateParticipant } from "../../../../../../react-query-hooks/participant/useUpdateParticipant";

import styles from "./styles.module.scss";

interface Props {
  participants: Participant[] | undefined;
  condensed?: boolean;
}

type Filters = Record<"country" | "start", FilterValue | null> | null;

const ParticipantsList: FC<Props> = ({ participants, condensed = true }) => {
  const { season } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: countries } = useGetCountries(
    getYearSelector(season?.split("-")?.[0])
  );

  const { mutateAsync: updateParticipant, isPending } = useUpdateParticipant();

  const [filterInfo, setFilterInfo] = useState<Filters>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const isEditing = (record: Participant) => record.id === editingId;

  const save = async (id: number) => {
    try {
      const values = await form.validateFields();

      await updateParticipant({
        id,
        participantDto: {
          clubId: values.club,
          startingStage: values.startingStage,
        },
      });

      setEditingId(null);

      messageApi.open({
        type: "success",
        content: t("tournament.participants.list.replaced"),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  const edit = (record: Partial<Participant>) => {
    form.setFieldsValue({
      club: record.club?.id,
      startingStage: record.startingStage,
    });

    setEditingId(record.id ?? null);
  };

  const columns: TableProps<Participant>["columns"] = [
    {
      key: "country",
      title: t("tournament.participants.list.columns.country"),
      dataIndex: "club",
      width: condensed ? 50 : 120,
      ellipsis: true,
      render: (club: Participant["club"]) => (
        <span className={styles.country}>
          <span className={styles.name}>{club.city.country.name}</span>
          <span className={styles.code}>
            <Flag country={club.city.country} />
          </span>
        </span>
      ),
      filters:
        countries?.map(({ id, name }) => ({ text: name, value: id })) || [],
      onFilter: (value, record) => record.club.city.country.id === value,
      filteredValue: filterInfo?.country || null,
      filterMultiple: false,
    },
    {
      key: "club",
      title: t("tournament.participants.list.columns.club"),
      dataIndex: "club",
      width: condensed ? 120 : 300,
      render: (club: Participant["club"], { fromStage }: Participant) => (
        <Club club={club} dimmed={!!fromStage} showCountry={false} />
      ),
      onCell: (record: Participant) =>
        ({
          record,
          editing: isEditing(record),
          dataIndex: "club",
        } as EditableCellProps),
    },
    {
      key: "start",
      title: t("tournament.participants.list.columns.start"),
      dataIndex: "startingStage",
      width: condensed ? 80 : 120,
      render: (startingStage: string, { fromStage }: Participant) => {
        const text = t(
          `tournament.stage.${startingStage}${
            startingStage === StageType.GROUP ||
            startingStage === StageType.GROUP_2
              ? ".short"
              : ""
          }`
        );

        return (
          <Typography.Text
            type={fromStage ? "secondary" : undefined}
            ellipsis={{ tooltip: text }}
          >
            {text}
          </Typography.Text>
        );
      },
      onCell: (record: Participant) =>
        ({
          record,
          editing: isEditing(record),
          dataIndex: "startingStage",
        } as EditableCellProps),
      filters: Object.values(StageType).map((stageType) => ({
        text: t(
          `tournament.stage.${stageType}${
            stageType === StageType.GROUP || stageType === StageType.GROUP_2
              ? ".short"
              : ""
          }`
        ),
        value: stageType,
      })),
      onFilter: (value, record) => record.startingStage === value,
      filterMultiple: false,
      filteredValue: filterInfo?.start || null,
    },
    {
      key: "from",
      title: t("tournament.participants.list.columns.from"),
      dataIndex: "fromStage",
      width: condensed ? 90 : 150,
      render: (fromStage: Participant["fromStage"]) => {
        if (!fromStage) {
          return null;
        }

        const text =
          t(
            getTournamentTitle(
              {
                season,
                tournament: fromStage.tournamentSeason.tournament,
              },
              { short: true }
            )
          ) +
          ": " +
          t(
            `tournament.stage.${fromStage?.stageType}${
              fromStage?.stageType === StageType.GROUP ||
              fromStage?.stageType === StageType.GROUP_2
                ? ".short"
                : ""
            }`
          );

        return (
          <Typography.Text type="secondary" ellipsis={{ tooltip: text }}>
            {text}
          </Typography.Text>
        );
      },
    },
    {
      key: "actions",
      width: 48,
      render: (_: string, record: Participant) => {
        if (record.fromStage) {
          return null;
        }

        const editable = isEditing(record);

        return editable ? (
          <span>
            <Button
              type="link"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => save(record.id)}
              disabled={isPending}
            />
            <Button
              type="link"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setEditingId(null)}
              disabled={isPending}
            />
          </span>
        ) : (
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            disabled={editingId !== null}
            onClick={() => edit(record)}
          />
        );
      },
    },
  ];

  const handleChange = (_: TablePaginationConfig, filters: Filters) => {
    setFilterInfo(filters);
  };

  return (
    <Form form={form} component={false}>
      {contextHolder}
      <Table<Participant>
        components={{
          body: { cell: EditableCell },
        }}
        columns={columns}
        dataSource={participants}
        rowKey="id"
        size="small"
        sticky
        pagination={
          filterInfo?.country || filterInfo?.start
            ? false
            : {
                total: participants?.length,
                showTotal: (total, range) =>
                  t("common.total", {
                    from: range[0],
                    to: range[1],
                    total,
                  }),
              }
        }
        onChange={handleChange}
      />
    </Form>
  );
};

export { ParticipantsList };
