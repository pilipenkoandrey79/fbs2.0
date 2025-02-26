import { Button, Divider, Form, Modal } from "antd";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ClubWithWinner,
  DeductedPoints,
  Group,
  GROUP_STAGES,
  ONE_MATCH_STAGES,
  Participant,
  StageInternal,
  StageSchemeType,
  StageTableRow,
  TournamentStage,
} from "@fbs2.0/types";
import { PlusOutlined } from "@ant-design/icons";
import { getStageTransKey } from "@fbs2.0/utils";

import { TeamCell } from "./components/TeamCell";
import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";
import { ResultCell } from "./components/ResultCell";
import { getAvailableStageParticipants } from "../../../../../../utils";

import styles from "./styles.module.scss";

export interface MatchesDto {
  matches: StageTableRow[];
}

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
  const { t } = useTranslation();
  const rows = matches?.[group as Group]?.tours?.[tour || 1] || [];
  const [form] = Form.useForm<MatchesDto>();

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

  const submit = (values: MatchesDto) => {
    console.log(values);
    close();
  };

  const close = () => {
    onClose();
    form.resetFields();
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
      onClose={close}
      onCancel={close}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        <Form<MatchesDto>
          form={form}
          onFinish={submit}
          initialValues={{ matches: rows }}
        >
          <table className={styles.table}>
            <Form.List name="matches">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index, array) => {
                    const host: ClubWithWinner = form.getFieldValue([
                      "matches",
                      field.name,
                      "host",
                    ]);

                    const guest: ClubWithWinner = form.getFieldValue([
                      "matches",
                      field.name,
                      "guest",
                    ]);

                    const clearResult = (key: number) => {
                      form.setFieldValue(
                        ["matches", field.name, "results", key],
                        {},
                      );
                    };

                    return (
                      <tbody key={field.key}>
                        <tr>
                          {array.length > 5 && (
                            <td className={styles.number} rowSpan={2}>
                              {index + 1}
                            </td>
                          )}
                          <TeamCell
                            name={[field.name, "host"]}
                            form={form}
                            selectedIds={selectedIds}
                            participants={
                              host.id !== undefined
                                ? [...participantsOptions, host]
                                : participantsOptions
                            }
                          />
                          <Form.Item noStyle name={[field.name, "tour"]} />
                          <Form.Item noStyle name={[field.name, "group"]} />
                          <ResultCell
                            name={[field.name, "results"]}
                            form={form}
                            remove={remove}
                            clearResult={clearResult}
                            stageScheme={stage.stageScheme}
                          />
                        </tr>
                        <tr>
                          <TeamCell
                            name={[field.name, "guest"]}
                            form={form}
                            selectedIds={selectedIds}
                            participants={
                              guest.id !== undefined
                                ? [...participantsOptions, guest]
                                : participantsOptions
                            }
                          />
                        </tr>
                      </tbody>
                    );
                  })}
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
                                  ? [{}]
                                  : [{ answer: false }, { answer: true }],
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
          <SubmitButton form={form} label={t("common.save")} size="small" />
        </Form>
      </div>
    </Modal>
  );
};

export { EditTableDialog };
