import {
  ClubWithWinner,
  GROUP_STAGES,
  MatchResultDto,
  ONE_MATCH_STAGES,
  Stage,
  StageSchemeType,
  StageTableRow,
} from "@fbs2.0/types";
import {
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Typography,
} from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isNotEmpty } from "@fbs2.0/utils";
import classNames from "classnames";

import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";
import { Club } from "../../../../../../../../../../components/Club";
import { DateInput } from "../../../../../../../../../../components/selectors/DateInput";
import { useUpdateMatchResult } from "../../../../../../../../../../react-query-hooks/match/useUpdateMatchResult";
import { useCreateMatch } from "../../../../../../../../../../react-query-hooks/match/useCreateMatch";

import styles from "./style.module.scss";

export type Result = { match: StageTableRow; date: string };

interface ResultFormValues extends Omit<MatchResultDto, "deductions"> {
  hostDeduction?: number;
  guestDeduction?: number;
}

interface Props {
  row: Result;
  stage: Stage;
  availableDates: string[];
  onClose: () => void;
}

const ResultForm: FC<Props> = ({ onClose, row, stage, availableDates }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ResultFormValues>();
  const values = Form.useWatch([], form);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  const [showFoceWinner, setShowFoceWinner] = useState(false);
  const [pristine, setPristine] = useState(true);

  const [showDeduction, setShowDeduction] = useState(
    () => (row.match.deductedPointsList?.length || 0) > 0
  );

  const initialValues = {
    ...(row.date
      ? {
          ...row.match.results.find(({ date }) => date === row.date),
          forceWinnerId: row.match.forceWinnerId,
        }
      : {
          answer: row.match.results.length > 0,
          hostScore: 0,
          guestScore: 0,
          date: availableDates?.[(availableDates.length || 0) - 1] || undefined,
        }),
    tour: row.match.tour,
    hostDeduction: row.match.deductedPointsList?.find(
      ({ participant }) => participant.id === row.match.host.id
    )?.points,
    guestDeduction: row.match.deductedPointsList?.find(
      ({ participant }) => participant.id === row.match.guest.id
    )?.points,
  } as ResultFormValues;

  const updateMatch = useUpdateMatchResult();
  const createMatch = useCreateMatch();

  const isNotKnockoutStage = [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
    stage.stageScheme.type
  );

  const isOneMatchStage = ONE_MATCH_STAGES.includes(stage.stageScheme.type);

  const submit = async (values: ResultFormValues) => {
    const { hostDeduction, guestDeduction, ...payload } = values;

    (payload as MatchResultDto).deductions =
      hostDeduction || guestDeduction
        ? [
            { participantId: row.match.host.id, points: hostDeduction || 0 },
            {
              participantId: row.match.guest.id,
              points: guestDeduction || 0,
            },
          ].filter(({ points }) => points > 0)
        : undefined;

    if (row.date) {
      await updateMatch.mutateAsync({ id: row.match.id, payload });
    } else {
      await createMatch.mutateAsync({
        ...payload,
        date: values?.date || "",
        hostId: row.match.host.id,
        guestId: row.match.guest.id,
        stageType: stage.stageType,
      });
    }

    onClose();
  };

  useEffect(() => {
    const isOneMatch = ONE_MATCH_STAGES.includes(stage.stageScheme.type);

    if (!isOneMatch && !values?.answer) {
      setShowAdditionalSection(false);

      return;
    }

    const previousResult = isOneMatch
      ? undefined
      : row.match.results.find(({ answer, date }) => !answer && !!date);

    const totalHostScore =
      (values?.hostScore || 0) + (previousResult?.hostScore || 0);

    const totalGuestScore =
      (values?.guestScore || 0) + (previousResult?.guestScore || 0);

    const hostAwayScore = values?.hostScore || 0;
    const guestAwayScore = previousResult?.guestScore || 0;

    setShowAdditionalSection(
      totalHostScore === totalGuestScore &&
        (stage.stageScheme.awayGoal ? hostAwayScore === guestAwayScore : true)
    );
  }, [
    row.match.results,
    stage.stageScheme.awayGoal,
    stage.stageScheme.type,
    values?.answer,
    values?.guestScore,
    values?.hostScore,
  ]);

  useEffect(() => {
    setShowFoceWinner(
      !!values?.unplayed ||
        (!stage.stageScheme.pen &&
          isNotEmpty(values?.hostPen) &&
          isNotEmpty(values?.guestPen) &&
          values?.hostPen === values?.guestPen) ||
        (!!initialValues.answer && !!initialValues.forceWinnerId)
    );
  }, [
    initialValues.answer,
    initialValues.forceWinnerId,
    row.match.forceWinnerId,
    stage.stageScheme.pen,
    values?.guestPen,
    values?.hostPen,
    values?.unplayed,
  ]);

  useEffect(() => {
    if (values?.tech) {
      form.setFieldsValue({
        hostScore: 3,
        guestScore: 0,
        unplayed: false,
        hostPen: undefined,
        guestPen: undefined,
      });
    }
  }, [form, values?.tech]);

  useEffect(() => {
    if (values?.unplayed) {
      form.setFieldsValue({
        hostScore: 0,
        guestScore: 0,
        tech: false,
        hostPen: undefined,
        guestPen: undefined,
      });
    }
  }, [form, values?.unplayed]);

  return (
    <Modal
      className={styles.modal}
      title={t(
        `tournament.stages.matches.form.title.${row.date ? "update" : "create"}`
      )}
      onClose={onClose}
      onCancel={onClose}
      width={300}
      maskClosable={false}
      open
      footer={null}
    >
      <div className={styles.content}>
        <Form
          form={form}
          onFinish={submit}
          onValuesChange={() => setPristine(false)}
          layout="horizontal"
          initialValues={initialValues}
          disabled={updateMatch.isPending}
        >
          {/** #1: date, answer, tour */}
          <Form.Item
            name="answer"
            layout="vertical"
            label={t(
              `tournament.stages.matches.form.answer.${
                values?.answer ? "true" : "false"
              }`
            )}
            className={classNames(styles.answer, styles["hidden-input"])}
            style={{
              display: isNotKnockoutStage || isOneMatchStage ? "none" : "block",
            }}
          >
            <Input type="hidden" />
          </Form.Item>
          <div
            className={styles["group-tour"]}
            style={{ display: isNotKnockoutStage ? "flex" : "none" }}
          >
            <span>
              {t("tournament.stages.matches.group_subtitle", {
                group: row.match.group,
              })}
            </span>
            <Form.Item
              name="tour"
              layout="vertical"
              label={t("tournament.stages.matches.subtitle", {
                tour: values?.tour,
              })}
              className={styles["hidden-input"]}
            >
              <Input type="hidden" />
            </Form.Item>
          </div>
          <DateInput
            name="date"
            label={t("tournament.stages.matches.form.date")}
            availableDates={availableDates}
          />

          {/** #2: unplayed, tech */}
          <Divider type="horizontal" />
          <div className={styles.panels}>
            {["unplayed", "tech"].map((key) => (
              <div key={key} className={styles.panel}>
                <Form.Item
                  name={key}
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
                      !!row.date ||
                      (key === "tech" ? values?.unplayed : values?.tech)
                    }
                  />
                </Form.Item>
              </div>
            ))}
          </div>

          {/** #3: scores */}
          <Divider type="horizontal" />
          <div
            className={styles.panels}
            style={{ display: values?.unplayed ? "none" : "flex" }}
          >
            {["host", "guest"].map((key) => (
              <div key={key} className={styles.panel}>
                <Club
                  club={
                    (row.match[key as keyof StageTableRow] as ClubWithWinner)
                      .club
                  }
                  className={styles.club}
                />
                <Form.Item name={`${key}Score`} className={styles.score}>
                  <InputNumber min={0} controls changeOnWheel />
                </Form.Item>
              </div>
            ))}
          </div>

          {/** #4: penalties or replay */}
          <div
            className={styles.additional}
            style={{
              display:
                showAdditionalSection && !values?.unplayed ? "block" : "none",
            }}
          >
            <div className={styles.title}>
              <span>
                {t(
                  `tournament.stages.matches.form.${
                    stage.stageScheme.pen ? "penalty" : "replay"
                  }`
                )}
              </span>
              {!stage.stageScheme.pen && <DateInput name="replayDate" />}
            </div>
            <div className={styles.panels}>
              {["hostPen", "guestPen"].map((key) => (
                <div key={key} className={styles.panel}>
                  <Form.Item name={key}>
                    <InputNumber min={0} controls changeOnWheel />
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>

          {/** #5: forceWinner */}
          <Form.Item
            name="forceWinnerId"
            label={t("tournament.stages.matches.form.force_winner")}
            className={styles["force-winner"]}
            style={{ display: showFoceWinner ? "block" : "none" }}
          >
            <Segmented
              options={[
                {
                  label: <Club club={row.match.host.club} showCity={false} />,
                  value: row.match.host.id,
                },
                {
                  label: <Club club={row.match.guest.club} showCity={false} />,
                  value: row.match.guest.id,
                },
              ]}
            />
          </Form.Item>

          {/** #6: Deduction */}
          {isNotKnockoutStage && (
            <div className={styles.deduction}>
              <label>
                {t("tournament.stages.matches.form.deduction")}{" "}
                <Checkbox
                  checked={showDeduction}
                  onChange={() => setShowDeduction(!showDeduction)}
                />
              </label>
              <div
                className={styles.panels}
                style={{ display: showDeduction ? "flex" : "none" }}
              >
                {["hostDeduction", "guestDeduction"].map((key) => (
                  <div key={key} className={styles.panel}>
                    <Form.Item name={key}>
                      <InputNumber min={0} controls changeOnWheel />
                    </Form.Item>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Divider type="horizontal" />
          <SubmitButton
            form={form}
            size="small"
            label={t("common.save")}
            forceDisabled={pristine}
          />
        </Form>
      </div>
    </Modal>
  );
};

export { ResultForm };
