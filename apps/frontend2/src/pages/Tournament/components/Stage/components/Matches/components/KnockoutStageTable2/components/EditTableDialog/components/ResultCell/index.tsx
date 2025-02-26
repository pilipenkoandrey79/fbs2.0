import { FC } from "react";
import { NamePath } from "antd/es/form/interface";
import {
  Button,
  Flex,
  Form,
  FormInstance,
  InputNumber,
  Popconfirm,
} from "antd";
import { ClearOutlined, DeleteOutlined } from "@ant-design/icons";
import { StageScheme } from "@fbs2.0/types";

import { DateInput } from "../../../../../../../../../../../../components/selectors/DateInput";
import { MoreResultCell } from "../MoreResultCell";
import { MatchesDto } from "../..";

import styles from "./styles.module.scss";

interface Props {
  name: NamePath;
  form: FormInstance<MatchesDto>;
  stageScheme: StageScheme;
  remove: (index: number | number[]) => void;
  clearResult: (key: number) => void;
}

const ResultCell: FC<Props> = ({
  name,
  form,
  stageScheme,
  remove,
  clearResult,
}) => (
  <td className={styles.result} rowSpan={2}>
    <Popconfirm title="Delete tournament pair?" onConfirm={() => remove(name)}>
      <Button
        danger
        icon={<DeleteOutlined />}
        size="small"
        type="text"
        className={styles.remove}
      />
    </Popconfirm>
    <table className={styles["result-table"]}>
      <tbody>
        <Form.List name={name}>
          {(fields) =>
            fields.map((field) => (
              <tr key={field.key}>
                <td className={styles.date}>
                  <DateInput
                    name={[field.name, "date"]}
                    size="small"
                    required={false}
                  />
                  <Form.Item noStyle name={[field.name, "answer"]} />
                </td>
                <td className={styles.score}>
                  <Flex
                    align="center"
                    gap={4}
                    justify="space-between"
                    style={{
                      display: !!form.getFieldValue([
                        "matches",
                        ...name,
                        field.name,
                        "unplayed",
                      ] as NamePath)
                        ? "none"
                        : "flex",
                    }}
                  >
                    <Form.Item name={[field.name, "hostScore"]}>
                      <InputNumber
                        min={0}
                        controls
                        changeOnWheel
                        size="small"
                        className={styles.number}
                      />
                    </Form.Item>
                    <span>:</span>
                    <Form.Item name={[field.name, "guestScore"]}>
                      <InputNumber
                        min={0}
                        controls
                        changeOnWheel
                        size="small"
                        className={styles.number}
                      />
                    </Form.Item>
                  </Flex>
                </td>
                <td className={styles.more}>
                  {form.getFieldValue(["matches", name[0], "host", "id"]) &&
                    form.getFieldValue(["matches", name[0], "guest", "id"]) && (
                      <MoreResultCell
                        namePath={["matches", ...name, field.name]}
                        form={form}
                        stageScheme={stageScheme}
                      />
                    )}
                </td>
                <td className={styles.clear}>
                  {form.getFieldValue([
                    "matches",
                    ...name,
                    field.name,
                    "date",
                  ] as NamePath) && (
                    <Popconfirm
                      title="Clear result?"
                      onConfirm={() => clearResult(field.key)}
                    >
                      <Button
                        danger
                        icon={<ClearOutlined />}
                        size="small"
                        type="text"
                      />
                    </Popconfirm>
                  )}
                </td>
              </tr>
            ))
          }
        </Form.List>
      </tbody>
    </table>
  </td>
);

export { ResultCell };
