import { Tournament, TournamentDto } from "@fbs2.0/types";
import { Button, Divider, Form, Modal } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SaveOutlined } from "@ant-design/icons";

import { TournamentSelector } from "../../../../components/selectors/TournamentSelector";
import { SeasonInput } from "../SeasonInput";
import { StageForm, StageFormItemType } from "../StageForm";
import { useCreateTournament } from "../../../../react-query-hooks/tournament/useCreateTournament";

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

  const submit = async (values: TournamentDto) => {
    await createTournament.mutateAsync(values);

    onClose();
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
          <h4>{t("home.tournament.stages")}</h4>
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
            {(fields, { add, remove }) => (
              <div className={styles.stage} key="stages">
                {(fields as StageFormItemType[]).map((field) => (
                  <StageForm
                    key={field.key}
                    form={form}
                    stage={field}
                    remove={() => {
                      remove(field.name);
                    }}
                  />
                ))}
                <Button type="dashed" onClick={() => add()} block>
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
