import { FC, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Flex,
  Form,
  FormInstance,
  FormListFieldData,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  KnockoutStageTableRowResult,
  MatchesDto,
  ONE_MATCH_STAGES,
  StageScheme,
} from "@fbs2.0/types";
import { NamePath } from "antd/es/form/interface";
import { ClearOutlined } from "@ant-design/icons";

import { DateInput } from "../../../../../../../../../../../../../../components/selectors/DateInput";
import { MoreResultCell } from "../MoreResultCell";

import styles from "./styles.module.scss";

interface Props {
  form: FormInstance<MatchesDto>;
  name: NamePath;
  field: FormListFieldData;
  stageScheme: StageScheme;
  removable: boolean;

  clearResult: (key: number) => void;
}

const Result: FC<Props> = ({
  form,
  name,
  field,
  stageScheme,
  removable,
  clearResult,
}) => {
  const namePath = ["matches", ...name, field.name];
  const [showPenaltyOrReplay, setShowPenaltyOrReplay] = useState(false);
  const values = Form.useWatch(namePath, form);

  useEffect(() => {
    const isOneMatch = ONE_MATCH_STAGES.includes(stageScheme.type);

    if (!isOneMatch && !values?.answer) {
      setShowPenaltyOrReplay(false);

      return;
    }

    const previousResult = isOneMatch
      ? undefined
      : (
          form.getFieldValue(
            namePath.slice(0, -1) as NamePath,
          ) as KnockoutStageTableRowResult[]
        ).find(({ answer }) => !answer);

    const totalHostScore =
      (values?.hostScore || 0) + (previousResult?.hostScore || 0);

    const totalGuestScore =
      (values?.guestScore || 0) + (previousResult?.guestScore || 0);

    const hostAwayScore = values?.hostScore || 0;
    const guestAwayScore = previousResult?.guestScore || 0;

    setShowPenaltyOrReplay(
      totalHostScore === totalGuestScore &&
        (stageScheme.awayGoal ? hostAwayScore === guestAwayScore : true),
    );
  }, [
    values?.answer,
    values?.hostScore,
    values?.guestScore,
    form,
    namePath,
    stageScheme.awayGoal,
  ]);

  useEffect(() => {
    if (!!values?.answer && !showPenaltyOrReplay && !!values?.replayDate) {
      form.setFieldValue([...namePath, "replayDate"] as NamePath, "");
    }
  }, []);

  return (
    <tr className={styles.result}>
      <td className={styles.date}>
        <DateInput name={[field.name, "date"]} size="small" required={false} />
        <Form.Item noStyle name={[field.name, "answer"]} />
      </td>
      <td className={styles.score}>
        <Flex
          align="center"
          gap={4}
          justify="space-between"
          style={{
            display: !!form.getFieldValue([...namePath, "unplayed"] as NamePath)
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
            <Badge
              dot={showPenaltyOrReplay || values?.unplayed || values?.tech}
            >
              <MoreResultCell
                namePath={namePath}
                form={form}
                stageScheme={stageScheme}
                showPenaltyOrReplay={showPenaltyOrReplay}
              />
            </Badge>
          )}
      </td>
      <td className={styles.clear}>
        {removable && form.getFieldValue([...namePath, "date"] as NamePath) && (
          <Popconfirm
            title="Clear result?"
            onConfirm={() => clearResult(field.key)}
          >
            <Button danger icon={<ClearOutlined />} size="small" type="text" />
          </Popconfirm>
        )}
      </td>
    </tr>
  );
};

export { Result };
