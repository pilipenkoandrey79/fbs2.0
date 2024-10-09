import {
  ClubWithWinner,
  MatchResultDto,
  ONE_MATCH_STAGES,
  StageScheme,
  StageTableRow,
} from "@fbs2.0/types";
import {
  Checkbox,
  Divider,
  Form,
  InputNumber,
  Modal,
  Segmented,
  Typography,
} from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isNotEmpty } from "@fbs2.0/utils";
import { MessageInstance } from "antd/es/message/interface";

import { SubmitButton } from "../../../../../../../../components/SubmitButton";
import { Club } from "../../../../../../../../components/Club";
import { DateInput } from "../../../../../../../../components/selectors/DateInput";
import { useUpdateMatchResult } from "../../../../../../../../react-query-hooks/match/useUpdateMatchResult";

import styles from "./style.module.scss";

export type Result = { match: StageTableRow; date: string };

interface Props {
  result: Result;
  stageScheme: StageScheme;
  messageApi: MessageInstance;
  onClose: () => void;
}

const ResultForm: FC<Props> = ({
  onClose,
  result,
  stageScheme,
  messageApi,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<MatchResultDto>();
  const values = Form.useWatch([], form);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  const [showFoceWinner, setShowFoceWinner] = useState(false);

  const initialValues = {
    ...(result.date
      ? result.match.results.find(({ date }) => date === result.date)
      : result.match.results[0]),
    forceWinnerId: result.match.forceWinnerId,
  };

  const updateMatch = useUpdateMatchResult();

  const submit = async (values: MatchResultDto) => {
    try {
      await updateMatch.mutateAsync({ id: result.match.id, payload: values });

      onClose();

      messageApi.open({
        type: "success",
        content: t("tournament.stages.results.match.updated"),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  useEffect(() => {
    if (!ONE_MATCH_STAGES.includes(stageScheme.type) && !values?.answer) {
      setShowAdditionalSection(false);

      return;
    }

    const previousResult = result.match.results.find(
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
        (stageScheme.awayGoal ? hostAwayScore === guestAwayScore : true)
    );
  }, [
    result.match.results,
    stageScheme.awayGoal,
    stageScheme.type,
    values?.answer,
    values?.guestScore,
    values?.hostScore,
  ]);

  useEffect(() => {
    setShowFoceWinner(
      !!values?.unplayed ||
        (!stageScheme.pen &&
          isNotEmpty(values?.hostPen) &&
          isNotEmpty(values?.guestPen) &&
          values?.hostPen === values?.guestPen)
    );
  }, [stageScheme.pen, values?.guestPen, values?.hostPen, values?.unplayed]);

  useEffect(() => {
    form.setFieldsValue(
      values?.tech
        ? {
            hostScore: 3,
            guestScore: 0,
            unplayed: false,
            hostPen: undefined,
            guestPen: undefined,
          }
        : {
            hostScore: initialValues?.hostScore || 0,
            guestScore: initialValues?.guestScore || 0,
            unplayed: initialValues?.unplayed,
            hostPen: initialValues?.hostPen ?? undefined,
            guestPen: initialValues?.guestPen ?? undefined,
          }
    );
  }, [
    form,
    initialValues?.guestPen,
    initialValues?.guestScore,
    initialValues?.hostPen,
    initialValues?.hostScore,
    initialValues?.unplayed,
    values?.tech,
  ]);

  useEffect(() => {
    form.setFieldsValue(
      values?.unplayed
        ? {
            hostScore: 0,
            guestScore: 0,
            tech: false,
            hostPen: undefined,
            guestPen: undefined,
          }
        : {
            hostScore: initialValues?.hostScore || 0,
            guestScore: initialValues?.guestScore || 0,
            tech: initialValues?.tech,
            forceWinnerId: null,
            hostPen: initialValues?.hostPen ?? undefined,
            guestPen: initialValues?.guestPen ?? undefined,
          }
    );
  }, [
    form,
    initialValues?.guestPen,
    initialValues?.guestScore,
    initialValues?.hostPen,
    initialValues?.hostScore,
    initialValues?.tech,
    values?.unplayed,
  ]);

  return (
    <Modal
      className={styles.modal}
      title={t(
        `tournament.stages.results.form.title.${
          result.date ? "update" : "create"
        }`
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
          layout="horizontal"
          initialValues={initialValues}
          disabled={updateMatch.isPending}
        >
          {/** #1: date, answer */}
          <Form.Item
            name="answer"
            label={t("tournament.stages.results.form.answer")}
            valuePropName="checked"
            rules={[{ required: true, message: "" }]}
            className={styles.answer}
          >
            <Checkbox disabled={!!result.date} />
          </Form.Item>
          <DateInput
            name="date"
            label={t("tournament.stages.results.form.date")}
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
                        tooltip: t(`tournament.stages.results.form.${key}`),
                      }}
                    >
                      {t(`tournament.stages.results.form.${key}`)}
                    </Typography.Text>
                  }
                  valuePropName="checked"
                >
                  <Checkbox
                    disabled={
                      !!result.date ||
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
                    (result.match[key as keyof StageTableRow] as ClubWithWinner)
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
                  `tournament.stages.results.form.${
                    stageScheme.pen ? "penalty" : "replay"
                  }`
                )}
              </span>
              {!stageScheme.pen && <DateInput name="replayDate" />}
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
            label={t("tournament.stages.results.form.force_winner")}
            className={styles["force-winner"]}
            style={{ display: showFoceWinner ? "block" : "none" }}
          >
            <Segmented
              options={[
                {
                  label: (
                    <Club club={result.match.host.club} showCity={false} />
                  ),
                  value: result.match.host.id,
                },
                {
                  label: (
                    <Club club={result.match.guest.club} showCity={false} />
                  ),
                  value: result.match.guest.id,
                },
              ]}
            />
          </Form.Item>

          <Divider type="horizontal" />
          <SubmitButton form={form} size="small" label={t("common.save")} />
        </Form>
      </div>
    </Modal>
  );
};

export { ResultForm };
