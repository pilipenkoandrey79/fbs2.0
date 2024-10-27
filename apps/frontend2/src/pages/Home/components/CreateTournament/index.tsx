import { Tournament, TournamentDto } from "@fbs2.0/types";
import { Button, Card, Divider, Form, Input, Modal, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";

import { TournamentSelector } from "./component/TournamentSelector";
import { SeasonInput } from "./component/SeasonInput";

import styles from "./style.module.scss";

interface Props {
  onClose: () => void;
}

const CreateTournament: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TournamentDto>();
  const values = Form.useWatch([], form);
  const [valid, setValid] = useState(true);

  const submit = (values: TournamentDto) => {
    console.log(values);

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
          <Form.List name="stages">
            {(fields, { add, remove }) => (
              <div className={styles.stage}>
                {fields.map((field) => (
                  <Card
                    size="small"
                    title={`Item ${field.name + 1}`}
                    key={field.key}
                    extra={
                      <CloseOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    }
                  >
                    <Form.Item label="Name" name={[field.name, "name"]}>
                      <Input />
                    </Form.Item>

                    {/* Nest Form.List */}
                    <Form.Item label="List">
                      <Form.List name={[field.name, "list"]}>
                        {(subFields, subOpt) => (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              rowGap: 16,
                            }}
                          >
                            {subFields.map((subField) => (
                              <Space key={subField.key}>
                                <Form.Item
                                  noStyle
                                  name={[subField.name, "first"]}
                                >
                                  <Input placeholder="first" />
                                </Form.Item>
                                <Form.Item
                                  noStyle
                                  name={[subField.name, "second"]}
                                >
                                  <Input placeholder="second" />
                                </Form.Item>
                                <CloseOutlined
                                  onClick={() => {
                                    subOpt.remove(subField.name);
                                  }}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => subOpt.add()}
                              block
                            >
                              + Add Sub Item
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  disabled={!valid}
                >
                  + Add Item
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
