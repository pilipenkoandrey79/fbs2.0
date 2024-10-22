import { Divider, Form, Input, Modal, Typography } from "antd";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stage, StageSubstitution, StageSubstitutionDto } from "@fbs2.0/types";
import { useParams } from "react-router";
import { ArrowRightOutlined } from "@ant-design/icons";

import { ParticipantSelector } from "./components/ParticipantSelector";
import { ParticipantProps } from "../..";
import { useCreateSubstitution } from "../../../../../../../../react-query-hooks/tournament/useCreateSubstitution";
import { useGetParticipants } from "../../../../../../../../react-query-hooks/participant/useGetParticipants";
import { getStageParticipants } from "../../../../utils";
import { SubmitButton } from "../../../../../../../../components/SubmitButton";
import { Club } from "../../../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  stage: Stage;
  stageParticipants: ParticipantProps["participants"];
  currentSubstitutions: StageSubstitution[] | undefined;
  close: () => void;
}

const SubstitutionDialog: FC<Props> = ({
  close,
  stage,
  stageParticipants,
  currentSubstitutions,
}) => {
  const { season, tournament } = useParams();
  const [form] = Form.useForm<StageSubstitutionDto>();
  const { t } = useTranslation();
  const createSubstitution = useCreateSubstitution(stage.stageType);
  const participants = useGetParticipants(season, tournament);

  const usedIds = currentSubstitutions
    ?.map(({ sub, expelled }) => [sub.id, expelled.id])
    .flat();

  const targets = useMemo(
    () =>
      getStageParticipants(
        stageParticipants.seeded,
        stageParticipants.previousStageWinners,
        stageParticipants.skippers,
        currentSubstitutions
      ).filter(({ id }) => !usedIds?.includes(id)),
    [
      currentSubstitutions,
      stageParticipants.previousStageWinners,
      stageParticipants.seeded,
      stageParticipants.skippers,
      usedIds,
    ]
  );

  const subs = useMemo(
    () =>
      participants.data?.filter(
        ({ id }) =>
          !targets.find((participant) => participant.id === id) &&
          !usedIds?.includes(id)
      ),
    [participants.data, targets, usedIds]
  );

  const submit = async (values: StageSubstitutionDto) => {
    await createSubstitution.mutateAsync(values);

    close();
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
        initialValues={{ stageId: stage.id }}
      >
        <h4>{t("tournament.stages.substitutions.current")}</h4>
        {(currentSubstitutions?.length || 0) > 0 ? (
          currentSubstitutions?.map(({ id, expelled, sub }) => (
            <div className={styles.sub} key={id}>
              <Club club={expelled.club} />
              <ArrowRightOutlined />
              <Club club={sub.club} />
            </div>
          ))
        ) : (
          <Typography.Text italic type="secondary">
            {t("tournament.stages.substitutions.current_empty")}
          </Typography.Text>
        )}
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
