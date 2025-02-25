import { FC } from "react";
import { NamePath } from "antd/es/form/interface";
import { Button, Flex, Form, InputNumber, Popconfirm } from "antd";
import { ClearOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";

import { DateInput } from "../../../../../../../../../../../../components/selectors/DateInput";

import styles from "./styles.module.scss";

interface Props {
  name: NamePath;
  remove: (index: number | number[]) => void;
  clearResult: (key: number) => void;
}

const ResultCell: FC<Props> = ({ name, remove, clearResult }) => {
  return (
    <td className={styles.result} rowSpan={2}>
      <Popconfirm
        title="Delete tournament pair?"
        onConfirm={() => remove(name)}
      >
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
              fields.map((field) => {
                return (
                  <tr key={field.key}>
                    <td className={styles.date}>
                      <DateInput name={[field.name, "date"]} size="small" />
                    </td>
                    <td className={styles.score}>
                      <Flex align="center" gap={4} justify="space-between">
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
                      <MoreOutlined />
                    </td>
                    <td className={styles.clear}>
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
                    </td>
                  </tr>
                );
              })
            }
          </Form.List>
        </tbody>
      </table>
    </td>
  );
};

export { ResultCell };
