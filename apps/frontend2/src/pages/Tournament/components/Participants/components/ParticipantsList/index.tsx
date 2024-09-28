import { Participant, StageType } from "@fbs2.0/types";
import { Form, Table, TableProps } from "antd";
import { FilterValue, TablePaginationConfig } from "antd/es/table/interface";
import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CountryCell } from "./components/CountryCell";
import { StartCell } from "./components/StartCell";
import { FromCell } from "./components/FromCell";
import { Club } from "../../../../../../components/Club";
import { ActionsCell } from "./components/ActionsCell";
import { EditableCell, EditableCellProps } from "./components/EditableCell";
import {
  getYearSelector,
  useGetCountries,
} from "../../../../../../react-query-hooks/country/useGetCountries";
import { UserContext } from "../../../../../../context/userContext";

import "./styles.module.scss";

interface Props {
  participants: Participant[] | undefined;
  condensed?: boolean;
  adding: boolean;
}

type Filters = Record<"country" | "start", FilterValue | null> | null;

const ParticipantsList: FC<Props> = ({
  participants,
  condensed = true,
  adding,
}) => {
  const { season } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user } = useContext(UserContext);

  const { data: countries } = useGetCountries(
    getYearSelector(season?.split("-")?.[0])
  );

  const [filterInfo, setFilterInfo] = useState<Filters>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pristine, setPristine] = useState(true);

  const onCell = (dataIndex: string) => (record: Participant) =>
    ({
      record,
      editing: record.id === editingId && !adding,
      dataIndex,
    } as EditableCellProps);

  const columns: TableProps<Participant>["columns"] = [
    {
      key: "country",
      title: t("tournament.participants.list.columns.country"),
      dataIndex: "club",
      width: condensed ? 50 : 120,
      ellipsis: true,
      render: (club) => <CountryCell club={club} />,
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
      onCell: onCell("club"),
    },
    {
      key: "start",
      title: t("tournament.participants.list.columns.start"),
      dataIndex: "startingStage",
      width: condensed ? 80 : 120,
      render: (startingStage: string, { fromStage }: Participant) => (
        <StartCell startingStage={startingStage} fromStage={fromStage} />
      ),
      onCell: onCell("startingStage"),
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
      width: condensed ? 80 : 150,
      render: (fromStage: Participant["fromStage"]) => (
        <FromCell fromStage={fromStage} />
      ),
    },
    {
      key: "actions",
      width: 60,
      render: (_: string, record: Participant) =>
        adding || !user?.isEditor ? null : (
          <ActionsCell
            record={record}
            form={form}
            pristine={pristine}
            editingId={editingId}
            setEditingId={setEditingId}
            setPristine={setPristine}
          />
        ),
    },
  ];

  return (
    <Form
      form={form}
      component={false}
      onValuesChange={() => {
        setPristine(false);
      }}
    >
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
        onChange={(_: TablePaginationConfig, filters: Filters) => {
          setFilterInfo(filters);
          setEditingId(null);
        }}
      />
    </Form>
  );
};

export { ParticipantsList };
