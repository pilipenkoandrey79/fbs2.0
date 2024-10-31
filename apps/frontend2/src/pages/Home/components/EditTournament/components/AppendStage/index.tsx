import {
  StageDto,
  StageType,
  TournamentDto,
  TournamentSeason,
} from "@fbs2.0/types";
import { Button, Form } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SaveOutlined } from "@ant-design/icons";

import { useAppendStage } from "../../../../../../react-query-hooks/tournament/useAppendStage";
import { StageForm, StageFormItemType } from "../../../StageForm";

import styles from "./style.module.scss";

interface Props {
  tournamentSeason: TournamentSeason;
  lastStageType: StageType;
}

const AppendStage: FC<Props> = ({ tournamentSeason, lastStageType }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TournamentDto>();
  const values = Form.useWatch([], form);
  const [valid, setValid] = useState(true);
  const [start, end] = tournamentSeason.season.split("-").map(Number);

  const appendStage = useAppendStage(tournamentSeason);

  const submit = async (values: TournamentDto) => {
    const dto: StageDto = {
      ...values.stages[0],
      previousStageType: lastStageType,
    };

    await appendStage.mutateAsync(dto);

    form.resetFields();
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
    <Form<TournamentDto>
      form={form}
      onFinish={submit}
      layout="inline"
      className={styles.form}
      initialValues={{
        start,
        end,
        tournament: tournamentSeason.tournament,
        stages: [],
      }}
    >
      <Form.List name="stages">
        {(fields, { add, remove }) => (
          <div className={styles.stage} key="stages">
            {(fields as StageFormItemType[]).map((field) => (
              <StageForm
                key={field.key}
                form={form}
                stage={field}
                remove={() => remove(field.name)}
              />
            ))}
            {fields.length < 1 && (
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
            )}
          </div>
        )}
      </Form.List>
      {values?.stages.length > 0 && (
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
      )}
    </Form>
  );
};

export { AppendStage };
