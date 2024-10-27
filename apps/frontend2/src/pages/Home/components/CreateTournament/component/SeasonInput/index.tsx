import { FC, useState } from "react";
import { Button, Form, FormInstance, InputNumber } from "antd";
import { TournamentDto, Years } from "@fbs2.0/types";
import {
  ForwardOutlined,
  LinkOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import styles from "./style.module.scss";

interface Props {
  form: FormInstance<TournamentDto>;
}

const SeasonInput: FC<Props> = ({ form }) => {
  const { t } = useTranslation();
  const [locked, setLocked] = useState(true);
  const nextYear = new Date().getFullYear() + 1;

  return (
    <div className={styles.season}>
      {form.getFieldValue("start") !== nextYear &&
        form.getFieldValue("end") !== nextYear + 1 && (
          <Button
            icon={<ForwardOutlined />}
            size="small"
            onClick={() => {
              form.setFieldValue("start", nextYear);
              form.setFieldValue("end", nextYear + 1);
            }}
            className={styles.forward}
          />
        )}
      <Form.Item
        name="start"
        dependencies={["end", "tournament"]}
        rules={[{ required: true, message: "" }]}
        label={t("home.tournament.start")}
        className={styles.input}
      >
        <InputNumber
          min={Years.GLOBAL_START}
          controls
          changeOnWheel
          onChange={(value: number | null) => {
            if (locked && value !== null) {
              form.setFieldValue("end", value + 1);
            }
          }}
        />
      </Form.Item>
      <div className={styles.icons}>
        <Button
          icon={locked ? <UnlockOutlined /> : <LockOutlined />}
          size="small"
          className={styles.lock}
          onClick={() => setLocked(!locked)}
          title={t("home.tournament.lock")}
        />
        {locked && <LinkOutlined />}
      </div>
      <Form.Item
        name="end"
        dependencies={["start", "tournament"]}
        rules={[{ required: true, message: "" }]}
        label={t("home.tournament.end")}
        className={styles.input}
      >
        <InputNumber
          min={Years.GLOBAL_START + 1}
          controls
          changeOnWheel
          onChange={(value: number | null) => {
            if (locked && value !== null) {
              form.setFieldValue("start", value - 1);
            }
          }}
        />
      </Form.Item>
    </div>
  );
};

export { SeasonInput };
