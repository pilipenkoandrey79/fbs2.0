import { FC } from "react";
import { NamePath } from "antd/es/form/interface";
import { Flex, Form, InputNumber } from "antd";
import { DeleteOutlined, MoreOutlined } from "@ant-design/icons";

import { DateInput } from "../../../../../../../../../../../../components/selectors/DateInput";

import styles from "./styles.module.scss";

interface Props {
  name: NamePath;
}

const ResultCell: FC<Props> = ({ name }) => {
  return (
    <td className={styles.result} rowSpan={2}>
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
                    <td className={styles.delete}>
                      <DeleteOutlined />
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
