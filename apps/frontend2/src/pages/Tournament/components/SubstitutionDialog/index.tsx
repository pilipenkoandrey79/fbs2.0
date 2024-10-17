import { Divider, Form, Input, message, Modal } from "antd";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StageSubstitution, StageSubstitutionDto } from "@fbs2.0/types";
import { useParams } from "react-router";

import { StageProps } from "../Stage";
import { SubmitButton } from "../../../../components/SubmitButton";
import { useCreateSubstitution } from "../../../../react-query-hooks/tournament/useCreateSubstitution";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { getStageParticipants } from "../Stage/utils";
import { ParticipantSelector } from "./components/ParticipantSelector";

interface Props {
  stageId: number;
  stageParticipants: StageProps["participants"];
  currentSubstitutions: StageSubstitution[] | undefined;
  close: () => void;
}

const SubstitutionDialog: FC<Props> = ({
  close,
  stageId,
  stageParticipants,
  currentSubstitutions,
}) => {
  const { season, tournament } = useParams();
  const [form] = Form.useForm<StageSubstitutionDto>();
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const createSubstitution = useCreateSubstitution();
  const participants = useGetParticipants(season, tournament);

  const targets = useMemo(
    () =>
      getStageParticipants(
        stageParticipants.seeded,
        stageParticipants.previousStageWinners,
        stageParticipants.skippers,
        currentSubstitutions
      ),
    [
      currentSubstitutions,
      stageParticipants.previousStageWinners,
      stageParticipants.seeded,
      stageParticipants.skippers,
    ]
  );

  const subs = useMemo(
    () =>
      participants.data?.filter(
        ({ id }) => !targets.find((participant) => participant.id === id)
      ),
    [participants.data, targets]
  );

  const submit = async (values: StageSubstitutionDto) => {
    try {
      await createSubstitution.mutateAsync(values);

      close();

      messageApi.open({
        type: "success",
        content: t("tournament.stages.substitutions.created", {
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

  return (
    <Modal
      open
      title={t("tournament.stages.substitutions.title")}
      onClose={close}
      onCancel={close}
      width={300}
      maskClosable={false}
      footer={null}
    >
      <Form
        form={form}
        onFinish={submit}
        layout="horizontal"
        disabled={createSubstitution.isPending}
        initialValues={{ stageId }}
      >
        {contextHolder}
        <Form.Item name="stageId">
          <Input type="hidden" />
        </Form.Item>
        <ParticipantSelector
          name="expelledId"
          label={t("tournament.stages.substitutions.label1")}
          options={targets}
        />
        <ParticipantSelector
          name="subId"
          label={t("tournament.stages.substitutions.label2")}
          options={subs}
        />
        <Divider type="horizontal" />
        <SubmitButton form={form} size="small" label={t("common.save")} />
      </Form>
    </Modal>
  );
};

export { SubstitutionDialog };
