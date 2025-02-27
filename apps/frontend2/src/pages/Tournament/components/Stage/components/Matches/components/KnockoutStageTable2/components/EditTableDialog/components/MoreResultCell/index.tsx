import { FC, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  FormInstance,
  InputNumber,
  Popover,
  Segmented,
  Typography,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { NamePath } from "antd/es/form/interface";
import {
  KnockoutStageTableRowResult,
  MatchesDto,
  ONE_MATCH_STAGES,
  StageScheme,
} from "@fbs2.0/types";

import { DateInput } from "../../../../../../../../../../../../components/selectors/DateInput";
import { Club } from "../../../../../../../../../../../../components/Club";

import styles from "./styles.module.scss";
import { isNotEmpty } from "@fbs2.0/utils";

interface Props {
  namePath: NamePath;
  form: FormInstance<MatchesDto>;
  stageScheme: StageScheme;
}

const MoreResultCell: FC<Props> = ({ namePath, form, stageScheme }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showPenaltyOrReplay, setShowPenaltyOrReplay] = useState(false);
  const [showFoceWinner, setShowFoceWinner] = useState(false);

  const values = Form.useWatch(namePath, form);

  const host = form.getFieldValue([
    ...namePath.slice(0, -2),
    "host",
  ] as NamePath);

  const guest = form.getFieldValue([
    ...namePath.slice(0, -2),
    "guest",
  ] as NamePath);

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
            namePath.slice(0, -1),
          ) as KnockoutStageTableRowResult[]
        ).find(({ answer, date }) => !answer && !!date);

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
    setShowFoceWinner(
      !!values?.unplayed ||
        (!stageScheme.pen &&
          isNotEmpty(values?.hostPen) &&
          isNotEmpty(values?.guestPen) &&
          values?.hostPen === values?.guestPen) ||
        (!!form.getFieldValue([namePath.at(-1), "answer"] as NamePath) &&
          !!form.getFieldValue([
            ...namePath.slice(0, -2),
            "forceWinnerId",
          ] as NamePath)),
    );
  }, [
    values?.unplayed,
    values?.hostPen,
    values?.guestPen,
    form,
    namePath,
    stageScheme.pen,
  ]);

  useEffect(() => {
    if (values?.tech) {
      form.setFieldValue([...namePath, "hostScore"] as NamePath, 3);
      form.setFieldValue([...namePath, "guestScore"] as NamePath, 0);
      form.setFieldValue([...namePath, "unplayed"] as NamePath, false);
      form.setFieldValue([...namePath, "hostPen"] as NamePath, undefined);
      form.setFieldValue([...namePath, "guestPen"] as NamePath, undefined);
    }
  }, [form, values?.tech]);

  useEffect(() => {
    if (values?.unplayed) {
      form.setFieldValue([...namePath, "hostScore"] as NamePath, 0);
      form.setFieldValue([...namePath, "guestScore"] as NamePath, 0);
      form.setFieldValue([...namePath, "tech"] as NamePath, false);
      form.setFieldValue([...namePath, "hostPen"] as NamePath, undefined);
      form.setFieldValue([...namePath, "guestPen"] as NamePath, undefined);
    }
  }, [form, values?.unplayed]);

  useEffect(() => {
    form.setFieldValue(
      [...namePath.slice(0, 2), "forceWinnerId"] as NamePath,
      values?.forceWinnerId,
    );
  }, [values?.forceWinnerId]);

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      content={
        <Flex vertical className={styles.content}>
          {/** #1: unplayed, tech */}
          {["unplayed", "tech"].map((key) => (
            <div key={key}>
              <Form.Item
                name={[namePath.at(-1) as number, key]}
                label={
                  <Typography.Text
                    ellipsis={{
                      tooltip: t(`tournament.stages.matches.form.${key}`),
                    }}
                  >
                    {t(`tournament.stages.matches.form.${key}`)}
                  </Typography.Text>
                }
                valuePropName="checked"
              >
                <Checkbox
                  disabled={
                    !!values?.date ||
                    (key === "tech" ? values?.unplayed : values?.tech)
                  }
                />
              </Form.Item>
            </div>
          ))}

          {/** #2: penalties or replay */}
          <div
            style={{
              display:
                showPenaltyOrReplay && !values?.unplayed ? "block" : "none",
            }}
          >
            <div>
              <span>
                {t(
                  `tournament.stages.matches.form.${
                    stageScheme.pen ? "penalty" : "replay"
                  }`,
                )}
              </span>
              {!stageScheme.pen && (
                <DateInput name={[namePath.at(-1) as number, "replayDate"]} />
              )}
            </div>
            <Flex align="center" gap={4} justify="flex-start">
              <Form.Item name={[namePath.at(-1) as number, "hostPen"]}>
                <InputNumber
                  min={0}
                  controls
                  changeOnWheel
                  size="small"
                  className={styles.number}
                />
              </Form.Item>
              <span>:</span>
              <Form.Item name={[namePath.at(-1) as number, "guestPen"]}>
                <InputNumber
                  min={0}
                  controls
                  changeOnWheel
                  size="small"
                  className={styles.number}
                />
              </Form.Item>
            </Flex>
          </div>

          {/** #3: forceWinner */}
          <Form.Item
            name={[namePath.at(-1) as number, "forceWinnerId"]}
            label={t("tournament.stages.matches.form.force_winner")}
            style={{ display: showFoceWinner ? "block" : "none" }}
            layout="vertical"
          >
            <Segmented
              options={[
                {
                  label: <Club club={host.club} showCity={false} to={false} />,
                  value: host.id,
                },
                {
                  label: <Club club={guest.club} showCity={false} to={false} />,
                  value: guest.id,
                },
              ]}
            />
          </Form.Item>
        </Flex>
      }
    >
      <Button size="small" type="text" icon={<MoreOutlined />} />
    </Popover>
  );
};

export { MoreResultCell };
