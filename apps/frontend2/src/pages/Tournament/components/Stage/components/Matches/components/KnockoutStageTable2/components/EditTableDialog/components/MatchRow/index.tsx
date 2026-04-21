import {
  ClubWithWinner,
  KnockoutStageTableRowResult,
  MatchesDto,
  Participant,
  StageInternal,
} from "@fbs2.0/types";
import { Form, FormInstance, FormListFieldData, Input } from "antd";
import { FC } from "react";
import classNames from "classnames";
import { getWinner, isNotEmpty } from "@fbs2.0/utils";

import { TeamCell } from "../TeamCell";
import { ResultsCell } from "../ResultsCell";

import styles from "./styles.module.scss";

interface Props {
  form: FormInstance<MatchesDto>;
  field: FormListFieldData;
  num: number | undefined;
  stage: StageInternal;
  selectedIds: number[];
  participantsOptions: Participant[];

  remove: (index: number | number[]) => void;
}

const MatchRow: FC<Props> = ({
  form,
  field,
  num,
  stage,
  selectedIds,
  participantsOptions,
  remove,
}) => {
  const host: ClubWithWinner = form.getFieldValue([
    "matches",
    field.name,
    "host",
  ]);

  const guest: ClubWithWinner = form.getFieldValue([
    "matches",
    field.name,
    "guest",
  ]);

  const clearResult = (key: number) => {
    const answer = form.getFieldValue([
      "matches",
      field.name,
      "results",
      key,
      "answer",
    ]);

    form.setFieldValue(["matches", field.name, "results", key], {
      hostScore: null,
      guestScore: null,
      date: "",
      answer,
      ...(answer ? { replayDate: "" } : {}),
    } as KnockoutStageTableRowResult);
  };

  const winnerInfo = getWinner(
    form.getFieldValue(["matches", field.name, "results"]),
    !!stage.stageScheme.awayGoal,
    isNotEmpty(form.getFieldValue(["matches", field.name, "forceWinnerId"]))
      ? form.getFieldValue(["matches", field.name, "forceWinnerId"]) === host.id
        ? "host"
        : "guest"
      : undefined,
  );

  return (
    <tbody
      key={field.key}
      className={classNames(
        styles.match,
        styles[stage.tournamentSeason.tournament],
      )}
    >
      <tr>
        {num && (
          <td className={styles.number} rowSpan={2}>
            {num}
          </td>
        )}
        <Form.Item hidden name={[field.name, "id"]}>
          <Input />
        </Form.Item>
        <Form.Item hidden name={[field.name, "answerMatchId"]}>
          <Input />
        </Form.Item>
        <Form.Item hidden name={[field.name, "forceWinnerId"]}>
          <Input />
        </Form.Item>
        <TeamCell
          name={[field.name, "host"]}
          form={form}
          selectedIds={selectedIds}
          participants={
            host.id !== undefined
              ? [...participantsOptions, host]
              : participantsOptions
          }
          className={classNames(styles.host, {
            [styles.winner]: winnerInfo.host,
          })}
        />
        <Form.Item hidden name={[field.name, "tour"]}>
          <Input />
        </Form.Item>
        <Form.Item hidden name={[field.name, "group"]}>
          <Input />
        </Form.Item>
        <ResultsCell
          name={[field.name, "results"]}
          form={form}
          remove={remove}
          clearResult={clearResult}
          stage={stage}
          host={host}
          guest={guest}
          removable={(stage.nextStage?.matchesCount || 0) === 0}
        />
      </tr>
      <tr>
        <TeamCell
          name={[field.name, "guest"]}
          form={form}
          selectedIds={selectedIds}
          participants={
            guest.id !== undefined
              ? [...participantsOptions, guest]
              : participantsOptions
          }
          className={classNames(styles.guest, {
            [styles.winner]: winnerInfo.guest,
          })}
        />
      </tr>
    </tbody>
  );
};

export { MatchRow };
