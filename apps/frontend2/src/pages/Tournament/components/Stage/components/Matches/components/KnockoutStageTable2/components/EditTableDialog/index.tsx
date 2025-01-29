import { Button, Divider, Form, Modal } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  Group,
  Participant,
  StageInternal,
  StageTableRow,
  TournamentStage,
} from "@fbs2.0/types";

import { TeamCell } from "./components/TeamCell";
import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";

import styles from "./styles.module.scss";

export interface MatchesDto {
  matches: (StageTableRow & { hostId: number; guestId: number })[];
}

export interface BaseEditTableProps {
  matches: TournamentStage;
  stage: StageInternal;
  tour: number | undefined;
  group: Group | undefined;
}

interface Props extends BaseEditTableProps {
  participants: Participant[];
  open: boolean;
  onClose: () => void;
}

const EditTableDialog: FC<Props> = ({ participants, open, onClose }) => {
  const { t } = useTranslation();

  const [form] = Form.useForm<MatchesDto>();

  const selectedIds = Form.useWatch(["matches"], form)?.reduce<number[]>(
    (acc, row) => [...acc, row?.hostId, row?.guestId],
    [],
  );

  const availableTeamOptions = participants?.filter(
    ({ id }) => !selectedIds?.includes(id),
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
        <Form<MatchesDto> form={form} layout="inline" onFinish={submit}>
          <Form.List name="matches">
            {(fields, { add }) => (
              <div>
                <table className={styles.table}>
                  <tbody>
                    {fields.map((field, index, array) => (
                      <tr key={field.key}>
                        {array.length > 5 && (
                          <td className={styles.number}>{index + 1}</td>
                        )}
                        <TeamCell
                          name={[field.name, "hostId"]}
                          participants={availableTeamOptions}
                        />
                        <td></td>
                        <TeamCell
                          name={[field.name, "guestId"]}
                          participants={availableTeamOptions}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
                {availableTeamOptions.length > 0 && (
                  <Button
                    type="dashed"
                    size="small"
                    onClick={() => {
                      add();
                    }}
                  >
                    +
                  </Button>
                )}
              </div>
            )}
          </Form.List>
          <Divider type="horizontal" />
          <SubmitButton form={form} label={t("common.save")} size="small" />
        </Form>
      </div>
    </Modal>
  );
};

export { EditTableDialog };
