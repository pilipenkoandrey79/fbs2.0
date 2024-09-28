import { ParticipantDto } from "@fbs2.0/types";
import { Form, message } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { SubmitButton } from "../../../../../../components/SubmitButton";
import { ParticipantSelector } from "../../../../../../components/selectors/ParticipantSelector";
import { StageTypeSelector } from "../../../../../../components/selectors/StageTypeSelector";
import { useCreateParticipant } from "../../../../../../react-query-hooks/participant/useCreateParticipant";

import styles from "./styles.module.scss";

interface Props {
  close: () => void;
}

const AddForm: FC<Props> = ({ close }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ParticipantDto>();
  const createParticipant = useCreateParticipant();

  const submit = async (values: ParticipantDto) => {
    try {
      await createParticipant.mutateAsync(values);

      close();

      messageApi.open({
        type: "success",
        content: t("tournament.participants.list.added"),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  return (
    <Form form={form} layout="horizontal" onFinish={submit}>
      {contextHolder}
      <div className={styles.selectors}>
        <ParticipantSelector used={false} />
        <StageTypeSelector startingStages name="startingStage" />
      </div>

      <SubmitButton form={form} size="small" />
    </Form>
  );
};

export { AddForm };
