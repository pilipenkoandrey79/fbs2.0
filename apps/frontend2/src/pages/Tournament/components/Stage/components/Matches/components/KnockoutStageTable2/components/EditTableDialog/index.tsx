import { Button, Divider, Form, Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  DeductedPoints,
  Group,
  GROUP_STAGES,
  KnockoutStageTableRowResult,
  MatchesDto,
  ONE_MATCH_STAGES,
  Participant,
  StageInternal,
  StageSchemeType,
  StageTableRow,
  Tournament,
  TournamentStage,
} from "@fbs2.0/types";
import { PlusOutlined } from "@ant-design/icons";
import { getStageTransKey, isNotEmpty } from "@fbs2.0/utils";
import { useParams } from "react-router";
import classNames from "classnames";

import { MatchRow } from "./components/MatchRow";
import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";
import { getAvailableStageParticipants } from "../../../../../../utils";
import { useUpdateKnockoutMatchTable } from "../../../../../../../../../../react-query-hooks/match/useUpdateKnockoutMatchTable";

import styles from "./styles.module.scss";

export interface BaseEditTableProps {
  matches: TournamentStage;
  stage: StageInternal;
  tour: number | undefined;
  group: Group | undefined;
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[] | undefined;
  };
}

interface Props extends BaseEditTableProps {
  open: boolean;
  onClose: () => void;
}

const EditTableDialog: FC<Props> = ({
  matches,
  participants,
  stage,
  group,
  tour,
  open,
  onClose,
}) => {
  const { season, tournament } = useParams();
  const { t } = useTranslation();
  const rows = matches?.[group as Group]?.tours?.[tour || 1] || [];
  const [form] = Form.useForm<MatchesDto>();

  const updateTable = useUpdateKnockoutMatchTable(
    season,
    tournament as Tournament,
    stage,
    group,
    tour,
  );

  const initialValues: MatchesDto = {
    matches: rows.map((row) => {
      if (isNotEmpty(row.forceWinnerId)) {
        const answerMatchIdx = row.results.findIndex((result) => result.answer);

        if (answerMatchIdx !== -1) {
          row.results[answerMatchIdx] = {
            ...row.results[answerMatchIdx],
            forceWinnerId: row.forceWinnerId,
          } as KnockoutStageTableRowResult & {
            forceWinnerId: number | null | undefined;
          };
        }
      }

      const deductedPointsList = [
        {
          participant: { id: row.host.id } as Participant,
          points:
            row.deductedPointsList?.find(
              ({ participant }) => row.host.id === participant.id,
            )?.points || 0,
        } as DeductedPoints,
        {
          participant: { id: row.guest.id } as Participant,
          points:
            row.deductedPointsList?.find(
              ({ participant }) => row.guest.id === participant.id,
            )?.points || 0,
        } as DeductedPoints,
      ].filter(({ points }) => points > 0);

      row.deductedPointsList = deductedPointsList;

      return row;
    }),
  };

  const availableParticipants = getAvailableStageParticipants(
    participants.seeded,
    participants.previousStageWinners,
    participants.skippers,
    { stage, matches },
    group,
  );

  const selectedIds =
    Form.useWatch(["matches"], form)?.reduce<number[]>(
      (acc, row) => [...acc, row?.host.id, row?.guest.id],
      [],
    ) || [];

  const participantsOptions = availableParticipants.filter(
    ({ id }) => !selectedIds.includes(id),
  );

  const nResults = [
    ...ONE_MATCH_STAGES,
    ...GROUP_STAGES,
    StageSchemeType.LEAGUE,
  ].includes(stage.stageScheme.type)
    ? 1
    : 2;

  const submit = async (values: MatchesDto) => {
    await updateTable.mutateAsync(values);

    onClose();
  };

  return (
    <Modal
      open={open}
      className={styles.modal}
      title={
        <span>
          {`${t(getStageTransKey(stage.stageType, false, group), { group })}${
            [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
              stage.stageScheme.type,
            )
              ? ` (${t("tournament.stages.matches.subtitle", {
                  tour,
                })})`
              : ""
          }`}

          <br />
          {t("tournament.stages.matches.edit.title")}
        </span>
      }
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
      destroyOnClose
    >
      <div className={styles.content}>
        <Form<MatchesDto>
          form={form}
          onFinish={submit}
          initialValues={initialValues}
          key={`${stage.tournamentSeason.season}-${stage.tournamentSeason.tournament}-${stage.stageType}`}
        >
          <table
            className={classNames(
              styles.table,
              styles[stage.tournamentSeason.tournament],
            )}
          >
            <Form.List name="matches">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index, array) => (
                    <MatchRow
                      form={form}
                      field={field}
                      key={field.key}
                      num={array.length > 5 ? index + 1 : undefined}
                      stage={stage}
                      selectedIds={selectedIds}
                      participantsOptions={participantsOptions}
                      remove={remove}
                    />
                  ))}
                  <tbody>
                    <tr>
                      <td colSpan={fields.length > 5 ? 3 : 2}>
                        <Button
                          size="small"
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            add({
                              host: {},
                              guest: {},
                              group,
                              tour,
                              results:
                                nResults === 1
                                  ? [
                                      {
                                        date: "",
                                        hostScore: 0,
                                        guestScore: 0,
                                      },
                                    ]
                                  : [
                                      {
                                        date: "",
                                        hostScore: 0,
                                        guestScore: 0,
                                        answer: false,
                                      },
                                      {
                                        date: "",
                                        hostScore: 0,
                                        guestScore: 0,
                                        answer: true,
                                      },
                                    ],
                            } as StageTableRow)
                          }
                          disabled={
                            selectedIds.length >= availableParticipants.length
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </>
              )}
            </Form.List>
          </table>
          <Divider type="horizontal" />
          <SubmitButton
            form={form}
            label={t("common.save")}
            size="small"
            loading={updateTable.isPending}
          />
        </Form>
      </div>
    </Modal>
  );
};

export { EditTableDialog };
