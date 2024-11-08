import { Country, NAME_FIELD_LENGTH } from "@fbs2.0/types";
import { Form, Input, Typography } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Flag } from "../../../../components/Flag";

import styles from "./styles.module.scss";

interface Props {
  namePrefix?: number;
  required?: boolean;
  className?: string;
}

const NameField: FC<Props> = ({ namePrefix, required = true, className }) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.field, className)}>
      <Typography.Paragraph>{t("common.name")}:</Typography.Paragraph>
      <Form.Item
        name={namePrefix !== undefined ? [namePrefix, "name"] : "name"}
        label={<Flag country={{ code: "gb" } as Country} />}
        labelCol={{ span: 3 }}
        rules={[{ required }, { max: NAME_FIELD_LENGTH }]}
        className={styles["field-item"]}
      >
        <Input showCount maxLength={NAME_FIELD_LENGTH} />
      </Form.Item>
      <Form.Item
        name={namePrefix !== undefined ? [namePrefix, "name_ua"] : "name_ua"}
        label={<Flag country={{ code: "ua" } as Country} />}
        labelCol={{ span: 3 }}
        rules={[{ max: NAME_FIELD_LENGTH }]}
        className={styles["field-item"]}
      >
        <Input showCount maxLength={NAME_FIELD_LENGTH} />
      </Form.Item>
    </div>
  );
};

export { NameField };
