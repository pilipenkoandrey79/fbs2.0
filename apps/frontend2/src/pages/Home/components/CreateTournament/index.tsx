import { StageDto, Tournament, TournamentDto } from "@fbs2.0/types";
import { Button, Divider, Form, Modal } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImportOutlined, SaveOutlined } from "@ant-design/icons";

import { TournamentSelector } from "../../../../components/selectors/TournamentSelector";
import { SeasonInput } from "../SeasonInput";
import { StageForm, StageFormItemType } from "../StageForm";
import { useCreateTournament } from "../../../../react-query-hooks/tournament/useCreateTournament";
import { useCopyFromPrevious } from "../../../../react-query-hooks/tournament/useCopyFromPrevious";

import styles from "./style.module.scss";

interface Props {
  onClose: () => void;
}

const CreateTournament: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TournamentDto>();
  const values = Form.useWatch([], form);
  const [valid, setValid] = useState(true);

  const createTournament = useCreateTournament();
  const copyFromPrevious = useCopyFromPrevious();

  const submit = async (values: TournamentDto) => {
    values.stages = values.stages.map((stage, index, stages) => ({
      ...stage,
      previousStageType: stages[index - 1]?.stageType || null,
    }));

    await createTournament.mutateAsync(values);

    onClose();
  };

  const onCopyFromPrevious = async () => {
    if (!values?.start || !values?.end || !values?.tournament) {
      return;
    }

    const stages = await copyFromPrevious.mutateAsync({
      tournament: values.tournament,
      season: [values.start - 1, values.end - 1].join("-"),
    });

    form.setFieldValue(
      "stages",
      stages.map<StageDto>(
        ({
          stageType,
          previousStage,
          linkedTournament,
          linkedTournamentStage,
          stageScheme: {
            isStarting,
            pen,
            type,
            awayGoal,
            groups,
            swissNum,
            swissTours,
          },
        }) => ({
          stageType,
          stageSchemeType: type,
          isStarting,
          pen: pen ?? undefined,
          awayGoal: awayGoal ?? undefined,
          groups,
          swissNum: swissNum ?? undefined,
          swissTours: swissTours ?? undefined,
          previousStageType: previousStage?.stageType,
          linkedTournament,
          linkedStage: linkedTournamentStage,
        })
      )
    );
  };

  useEffect(() => {
    setValid(false);

    form?.validateFields().then(
      () => {
        setValid(true);
      },
      () => null
    );
  }, [form, values]);

  return (
    <Modal
      open
      className={styles.modal}
      title={t("home.create")}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        <Form
          form={form}
          onFinish={submit}
          layout="inline"
          initialValues={{
            start: new Date().getFullYear(),
            end: new Date().getFullYear() + 1,
            tournament: Tournament.CHAMPIONS_LEAGUE,
            stages: [],
          }}
        >
          <SeasonInput form={form} />
          <TournamentSelector startOfSeason={values?.start} />
          <Divider />
          <div className={styles["stages-header"]}>
            <h4>{t("home.tournament.stages")}</h4>
            <Button
              size="small"
              icon={<ImportOutlined />}
              disabled={values?.stages.length > 0}
              onClick={() => onCopyFromPrevious()}
            >
              {t("home.tournament.stage.copy")}
            </Button>
          </div>
          <Form.List
            name="stages"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(
                      new Error(t("home.tournament.stage.error"))
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className={styles.stage} key="stages">
                {errors.length > 0 && (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                )}
                {(fields as StageFormItemType[]).map((field) => (
                  <StageForm
                    key={field.key}
                    form={form}
                    stage={field}
                    remove={() => remove(field.name)}
                    addAfter={() => {
                      add({ pen: true, awayGoal: false }, field.name + 1);
                    }}
                  />
                ))}
                <Button
                  type="dashed"
                  onClick={() => {
                    add({
                      pen: true,
                      awayGoal: false,
                      isStarting: fields.length < 1,
                    });
                  }}
                  block
                >
                  + {t("home.tournament.stage.add")}
                </Button>
              </div>
            )}
          </Form.List>
          <Divider type="horizontal" />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="small"
              disabled={!valid}
              role="button"
              icon={<SaveOutlined />}
              title={t("common.save")}
            >
              {t("common.save")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export { CreateTournament };
