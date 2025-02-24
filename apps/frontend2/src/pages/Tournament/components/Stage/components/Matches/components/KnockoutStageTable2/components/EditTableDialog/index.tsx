import { Button, Divider, Form, Modal } from "antd";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ClubWithWinner,
  Group,
  Participant,
  StageInternal,
  StageTableRow,
  TournamentStage,
} from "@fbs2.0/types";
import { PlusOutlined } from "@ant-design/icons";

import { TeamCell } from "./components/TeamCell";
import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";
import { ResultCell } from "./components/ResultCell";
import { getFilteredParticipants } from "../../../../../../utils";

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

  const participantsOptions = useMemo(
    () =>
      getFilteredParticipants(
        participants.seeded,
        participants.previousStageWinners,
        participants.skippers,
        { stage, matches },
        group,
        tour,
      ),
    [
      group,
      matches,
      participants.previousStageWinners,
      participants.seeded,
      participants.skippers,
      stage,
      tour,
    ],
  );

  const submit = (values: MatchesDto) => {
    console.log(values);
    close();
  };

  const close = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      className={styles.modal}
      title={t("tournament.stages.matches.edit.title")}
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
              {(fields, { add }) => (
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
                            participants={
                              (host?.id ?? undefined) !== undefined
                                ? [...participantsOptions, host]
                                : participantsOptions
                            }
                          />
                          <ResultCell name={[field.name, "results"]} />
                        </tr>
                        <tr>
                          <TeamCell
                            name={[field.name, "guest"]}
                            form={form}
                            participants={
                              (guest?.id ?? undefined) !== undefined
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
                            add({ host: {}, guest: {} } as StageTableRow)
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
