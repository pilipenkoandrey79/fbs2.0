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
import { CityDto, Years } from "@fbs2.0/types";
import { CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { NameField } from "../../../NameField";
import { SubmitButton } from "../../../../../../components/SubmitButton";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { useGetCity } from "../../../../../../react-query-hooks/city/useGetCity";
import { useCreateCity } from "../../../../../../react-query-hooks/city/useCreateCity";
import { useUpdateCity } from "../../../../../../react-query-hooks/city/useUpdateCity";
import { useDeleteCity } from "../../../../../../react-query-hooks/city/useDeleteCity";

import styles from "./styles.module.scss";

interface Props {
  id: number;
  countryId: number | undefined;
  isEmpty: boolean;
  onClose: () => void;
}

const CityDialog: FC<Props> = ({ onClose, id, countryId, isEmpty }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<CityDto>();
  const [pristine, setPristine] = useState(true);

  const city = useGetCity(id);
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity(countryId);

  const submit = async (values: CityDto) => {
    id === -1
      ? await createCity.mutateAsync(values)
      : await updateCity.mutateAsync({ ...values, id });

    form.resetFields();
    onClose();
  };

  const onDelete = async () => {
    await deleteCity.mutateAsync(id);

    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open
      className={styles.modal}
      title={t(`clubs.city.title.${id === -1 ? "create" : "edit"}`)}
      onClose={onClose}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      footer={[]}
    >
      <div className={styles.content}>
        {city.isSuccess && (
          <Form<CityDto>
            form={form}
            initialValues={{
              countryId,
              ...city.data,
              oldNames: city.data.oldNames?.map(({ country, ...oldName }) => ({
                ...oldName,
                countryId: country?.id,
              })),
            }}
            onFinish={submit}
            onValuesChange={() => setPristine(false)}
          >
            <NameField className={styles.name} />
            <Form.Item noStyle name="countryId" />
            <Form.List name="oldNames">
              {(fields, { add, remove }) => (
                <div key="oldNames">
                  <Typography.Paragraph className={styles.label}>
                    {t("clubs.city.fields.old_names")}:
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                    />{" "}
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
                          <CountrySelector
                            name={[field.name, "countryId"]}
                            required={false}
                            year={undefined}
                            className={styles.country}
                            label={t("clubs.city.fields.country")}
                          />
                          <Form.Item
                            name={[field.name, "till"]}
                            label={t("clubs.city.fields.till")}
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
              {isEmpty && (
                <Popconfirm
                  onConfirm={onDelete}
                  title={t("clubs.city.delete_confirm")}
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

export { CityDialog };
