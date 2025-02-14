import { Divider, Form, Modal } from "antd";
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
import { ResultCell } from "./components/ResultCell";

import styles from "./styles.module.scss";

export interface MatchesDto {
  matches: (StageTableRow & { hostId: number; guestId: number })[];
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

  const participantsOptions = [
    ...(participants.previousStageWinners || []),
    ...(participants.seeded || []),
    ...(participants.skippers || []),
  ];

  // const availableParticipants = useMemo(
  //   () =>
  //     getFilteredParticipants(
  //       participants.seeded,
  //       participants.previousStageWinners,
  //       participants.skippers,
  //       { stage, matches },
  //       group,
  //       tour,
  //     ),
  //   [
  //     group,
  //     matches,
  //     participants.previousStageWinners,
  //     participants.seeded,
  //     participants.skippers,
  //     stage,
  //     tour,
  //   ],
  // );

  // const selectedIds = Form.useWatch(["matches"], form)?.reduce<number[]>(
  //   (acc, row) => [...acc, row?.hostId, row?.guestId],
  //   [],
  // );

  // const availableTeamOptions = availableParticipants?.filter(
  //   ({ id }) => !selectedIds?.includes(id),
  // );

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
              {(fields) =>
                fields.map((field, index, array) => (
                  <tbody key={field.key}>
                    <tr>
                      {array.length > 5 && (
                        <td className={styles.number} rowSpan={2}>
                          {index + 1}
                        </td>
                      )}
                      <TeamCell
                        name={[field.name, "host", "id"]}
                        participants={participantsOptions}
                      />
                      <ResultCell name={[field.name, "results"]} />
                    </tr>
                    <tr>
                      <TeamCell
                        name={[field.name, "guest", "id"]}
                        participants={participantsOptions}
                      />
                    </tr>
                  </tbody>
                ))
              }
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
