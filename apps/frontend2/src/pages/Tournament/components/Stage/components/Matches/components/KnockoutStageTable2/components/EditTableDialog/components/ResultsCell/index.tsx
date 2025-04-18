import { FC } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import {
  MatchesDto,
  ClubWithWinner,
  GROUP_STAGES,
  StageSchemeType,
  StageInternal,
} from "@fbs2.0/types";
import { FormInstance, Popconfirm, Button, Form } from "antd";
import { NamePath } from "antd/es/form/interface";

import { Result } from "./components/Result";
import { Deduction } from "./components/Deduction";

import styles from "./styles.module.scss";

interface Props {
  name: NamePath;
  form: FormInstance<MatchesDto>;
  stage: StageInternal;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  removable: boolean;
  remove: (index: number | number[]) => void;
  clearResult: (key: number) => void;
}

const ResultsCell: FC<Props> = ({
  form,
  name,
  stage,
  removable,
  host,
  guest,
  remove,
  clearResult,
}) => (
  <td className={styles.results} rowSpan={2}>
    {removable && (
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
    )}
    <table className={styles["results-table"]}>
      <tbody>
        <Form.List name={name}>
          {(fields) =>
            fields.map((field) => (
              <Result
                key={field.key}
                form={form}
                field={field}
                name={name}
                stage={stage}
                removable={removable}
                clearResult={clearResult}
              />
            ))
          }
        </Form.List>
      </tbody>
    </table>
    {[...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
      stage.stageScheme.type,
    ) && <Deduction form={form} name={name} host={host} guest={guest} />}
  </td>
);

export { ResultsCell };
