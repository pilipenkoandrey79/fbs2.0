import {
  Button,
  Card,
  Divider,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Typography,
} from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClubDto, Years } from "@fbs2.0/types";
import { CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { SubmitButton } from "../../../../../../components/SubmitButton";
import { useGetClub } from "../../../../../../react-query-hooks/club/useGetClub";
import { useCreateClub } from "../../../../../../react-query-hooks/club/useCreateClub";
import { useUpdateClub } from "../../../../../../react-query-hooks/club/useUpdateClub";
import { useDeleteClub } from "../../../../../../react-query-hooks/club/useDeleteClub";
import { NameField } from "../../../NameField";

import styles from "./styles.module.scss";
interface Props {
  id: number;
  countryId: number | undefined;
  cityId: number | undefined;
  onClose: () => void;
}

const ClubDialog: FC<Props> = ({ onClose, id, countryId, cityId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ClubDto>();
  const [pristine, setPristine] = useState(true);

  const club = useGetClub(id);
  const createClub = useCreateClub(countryId);
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub(countryId);

  const submit = async (values: ClubDto) => {
    id === -1
      ? await createClub.mutateAsync(values)
      : await updateClub.mutateAsync({ ...values, id });

    form.resetFields();
    onClose();
  };

  const onDelete = async () => {
    await deleteClub.mutateAsync(id);

    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open
      className={styles.modal}
      title={t(`clubs.club.title.${id === -1 ? "create" : "edit"}`)}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        {club.isSuccess && (
          <Form<ClubDto>
            form={form}
            initialValues={{
              cityId,
              ...club.data,
              oldNames: club.data.oldNames || [],
            }}
            onFinish={submit}
            onValuesChange={() => setPristine(false)}
          >
            <NameField className={styles.name} />
            <Form.Item noStyle name="cityId" />
            <Form.List name="oldNames">
              {(fields, { add, remove }) => (
                <div key="oldNames">
                  <Typography.Paragraph className={styles.label}>
                    {t("clubs.club.fields.old_names")}:
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                    />
                  </Typography.Paragraph>
                  {fields.map((field) => (
                    <Card
                      key={field.name}
                      size="small"
                      className={styles["old-name"]}
                    >
                      <CloseOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                        className={styles.remove}
                      />
                      <Form.Item noStyle name={[field.name, "id"]} />
                      <div className={styles["old-name-container"]}>
                        <NameField
                          required={false}
                          namePrefix={field.name}
                          className={styles.name}
                        />
                        <div className={styles["old-name-sub-container"]}>
                          <Form.Item
                            name={[field.name, "till"]}
                            label={t("clubs.club.fields.till")}
                          >
                            <InputNumber
                              min={Years.GLOBAL_START}
                              controls
                              changeOnWheel
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Form.List>
            <Divider type="horizontal" />
            <div className={styles.footer}>
              <SubmitButton
                form={form}
                size="small"
                label={t("common.save")}
                forceDisabled={pristine}
              />
              {id >= 0 && (
                <Popconfirm
                  onConfirm={onDelete}
                  title={t("clubs.club.delete_confirm")}
                >
                  <Button
                    danger
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                  >
                    {t("common.delete")}
                  </Button>
                </Popconfirm>
              )}
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export { ClubDialog };
