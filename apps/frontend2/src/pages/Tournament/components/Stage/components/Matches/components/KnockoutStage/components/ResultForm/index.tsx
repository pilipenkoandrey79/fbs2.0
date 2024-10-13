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
import { MessageInstance } from "antd/es/message/interface";

import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";
import { Club } from "../../../../../../../../../../components/Club";
import { DateInput } from "../../../../../../../../../../components/selectors/DateInput";
import { useUpdateMatchResult } from "../../../../../../../../../../react-query-hooks/match/useUpdateMatchResult";
import { useCreateMatch } from "../../../../../../../../../../react-query-hooks/match/useCreateMatch";

import styles from "./style.module.scss";

export type Result = { match: StageTableRow; date: string };

interface Props {
  row: Result;
  stage: Stage;
  messageApi: MessageInstance;
  availableDates: string[];
  onClose: () => void;
}

const ResultForm: FC<Props> = ({
  onClose,
  row,
  stage,
  messageApi,
  availableDates,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<MatchResultDto>();
  const values = Form.useWatch([], form);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  const [showFoceWinner, setShowFoceWinner] = useState(false);
  const [pristine, setPristine] = useState(true);

  const initialValues = row.date
    ? {
        ...row.match.results.find(({ date }) => date === row.date),
        forceWinnerId: row.match.forceWinnerId,
      }
    : ({
        answer: row.match.results.length > 0,
        hostScore: 0,
        guestScore: 0,
      } as MatchResultDto);

  const updateMatch = useUpdateMatchResult();
  const createMatch = useCreateMatch();

  const submit = async (values: MatchResultDto) => {
    try {
      if (row.date) {
        await updateMatch.mutateAsync({ id: row.match.id, payload: values });
      } else {
        await createMatch.mutateAsync({
          ...values,
          date: values?.date || "",
          hostId: row.match.host.id,
          guestId: row.match.guest.id,
          stageType: stage.stageType,
        });
      }

      onClose();

      messageApi.open({
        type: "success",
        content: t(
          `tournament.stages.matches.match.${row.date ? "updated" : "entered"}`
        ),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  useEffect(() => {
    if (!ONE_MATCH_STAGES.includes(stage.stageScheme.type) && !values?.answer) {
      setShowAdditionalSection(false);

      return;
    }

    const previousResult = row.match.results.find(
      ({ answer, date }) => !answer && !!date
    );

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
          values?.hostPen === values?.guestPen)
    );
  }, [
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
          {/** #1: date, answer */}
          <Form.Item
            name="answer"
            label={
              [
                ...ONE_MATCH_STAGES,
                ...GROUP_STAGES,
                StageSchemeType.LEAGUE,
              ].includes(stage.stageScheme.type)
                ? undefined
                : t(
                    `tournament.stages.matches.form.answer.${
                      values?.answer ? "true" : "false"
                    }`
                  )
            }
            className={styles.answer}
          >
            <Input type="hidden" />
          </Form.Item>
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
                  <InputNumber min={0} controls />
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
                    <InputNumber min={0} controls />
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
