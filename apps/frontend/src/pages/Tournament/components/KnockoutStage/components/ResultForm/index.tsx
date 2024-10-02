import { FC, useCallback, useMemo, useState } from "react";
import { Button, Checkbox, Intent, Switch } from "@blueprintjs/core";
import { isNotEmpty } from "@fbs2.0/utils";
import {
  ClubWithWinner,
  _KnockoutStageTableRowResult,
  MatchDto,
  MatchResultDto,
  Stage,
} from "@fbs2.0/types";
import { DateTime } from "luxon";
import classNames from "classnames";

import { DateInput } from "../../../../../../components/DateInput";
import { NumberInput } from "../../../../../../components/NumberInput";
import { Club } from "../../../../../../components/Club";
import { useCreateMatch } from "../../../../../../react-query-hooks/matches/useCreateMatch";
import { useUpdateMatchResult } from "../../../../../../react-query-hooks/matches/useUpdateMatchResult";

import styles from "./styles.module.scss";

interface Props {
  matchId?: number;
  stage: Stage;
  host: ClubWithWinner;
  guest: ClubWithWinner;
  result?: _KnockoutStageTableRowResult;
  previousResult?: _KnockoutStageTableRowResult;
  date?: string;
  replayDate?: string;
  initialDate?: string;
  oneMatch?: boolean;
  replayInsteadOfPenalties?: boolean;
  forcedWinnerId?: number;
  availableDates?: string[];
  awayGoalRule?: boolean;

  saveCallback: () => void;
}

const ResultForm: FC<Props> = ({
  matchId,
  stage,
  result,
  previousResult,
  host,
  guest,
  date,
  replayDate,
  initialDate,
  oneMatch = false,
  replayInsteadOfPenalties = false,
  forcedWinnerId: propForceWinnerId,
  availableDates,
  awayGoalRule,
  saveCallback,
}) => {
  const [hostScore, setHostScore] = useState(() => result?.hostScore ?? 0);
  const [guestScore, setGuestScore] = useState(() => result?.guestScore ?? 0);

  const [penaltyPart, setPenaltyPart] = useState(
    () => isNotEmpty(result?.hostPen) || isNotEmpty(result?.guestPen)
  );

  const [isAnswer, setIsAnswer] = useState(() => {
    if (isNotEmpty(result)) {
      return result?.answer as boolean;
    } else {
      if (isNotEmpty(previousResult)) {
        return true;
      }
    }

    return false;
  });

  const [hostPenScore, setHostPenScore] = useState<number | undefined>(
    () => result?.hostPen ?? undefined
  );

  const [guestPenScore, setGuestPenScore] = useState<number | undefined>(
    () => result?.guestPen ?? undefined
  );

  const [dateValue, setDateValue] = useState<string | null>(
    () =>
      date ||
      (isAnswer
        ? DateTime.fromISO(initialDate ?? "")
            .plus({ days: 1 })
            .toISODate()
        : initialDate) ||
      null
  );

  const [replayDateValue, setReplayDateValue] = useState<string | null>(
    () => replayDate || null
  );

  const [forcedWinnerId, setForcedWinnerId] = useState<number | null>(
    () => (propForceWinnerId || host.id) ?? null
  );

  const [unplayed, setUnplayed] = useState(() => !!result?.unplayed);
  const [tech, setTech] = useState(() => !!result?.tech);

  const { mutate: createMatch, isLoading: isCreateLoading } =
    useCreateMatch(saveCallback);

  const { mutate: updateMatchResult, isLoading: isUpdateLoading } =
    useUpdateMatchResult(saveCallback);

  const showPenaltyBlock = useMemo(() => {
    if (!oneMatch && !isAnswer) {
      return false;
    }

    const totalHostScore = hostScore + (previousResult?.hostScore || 0);
    const totalGuestScore = guestScore + (previousResult?.guestScore || 0);
    const hostAwayScore = hostScore;
    const guestAwayScore = previousResult?.guestScore || 0;

    const show =
      totalHostScore === totalGuestScore &&
      (awayGoalRule ? hostAwayScore === guestAwayScore : true);

    if (show) {
      setReplayDateValue(
        DateTime.fromISO(dateValue ?? "")
          .plus({ days: 1 })
          .toISODate()
      );

      setForcedWinnerId(host.id);
    } else {
      setPenaltyPart(false);
      setReplayDateValue(null);
      setForcedWinnerId(null);
    }

    return show;
  }, [
    oneMatch,
    isAnswer,
    hostScore,
    previousResult?.hostScore,
    previousResult?.guestScore,
    guestScore,
    awayGoalRule,
    dateValue,
    host.id,
  ]);

  const changePenaltyPart = useCallback(() => {
    const newPenaltyPartValue = !penaltyPart;
    setPenaltyPart(newPenaltyPartValue);

    if (newPenaltyPartValue) {
      setReplayDateValue(
        DateTime.fromISO(dateValue ?? "")
          .plus({ days: 1 })
          .toISODate()
      );
    } else {
      setReplayDateValue(null);
      setForcedWinnerId(host.id);
    }
  }, [dateValue, host.id, penaltyPart]);

  const changeForceWinner = useCallback(() => {
    if (forcedWinnerId === host.id) {
      setForcedWinnerId(guest.id);
    } else {
      setForcedWinnerId(host.id);
    }
  }, [forcedWinnerId, guest.id, host.id]);

  const changeUnplayed = useCallback(() => {
    const newValue = !unplayed;

    setForcedWinnerId(unplayed ? host.id : null);
    setUnplayed(newValue);
  }, [host.id, unplayed]);

  const changeTech = useCallback(() => {
    const newValue = !tech;

    setHostScore(newValue ? 3 : 0);
    setGuestScore(0);
    setTech(newValue);
  }, [tech]);

  const onSave = useCallback(() => {
    if (dateValue === null) {
      return Promise.resolve(false);
    }

    const payload = {
      date: dateValue,
      hostScore,
      guestScore,
      hostPen: penaltyPart ? hostPenScore ?? 0 : undefined,
      guestPen: penaltyPart ? guestPenScore ?? 0 : undefined,
      answer: isAnswer,
      replayDate: penaltyPart ? replayDateValue : null,
      forceWinnerId:
        unplayed ||
        (penaltyPart &&
          replayInsteadOfPenalties &&
          hostPenScore === guestPenScore)
          ? forcedWinnerId
          : null,
      unplayed,
      tech,
    } as MatchDto;

    if (!isNotEmpty(date)) {
      payload.hostId = host.id;
      payload.guestId = guest.id;
      payload.stageType = stage.stageType;
    }

    return isNotEmpty(matchId)
      ? updateMatchResult({
          id: matchId as number,
          payload: payload as MatchResultDto,
        })
      : createMatch({
          tournament: stage.tournamentSeason.tournament,
          season: stage.tournamentSeason.season,
          matchDto: payload,
        });
  }, [
    dateValue,
    hostScore,
    guestScore,
    penaltyPart,
    hostPenScore,
    guestPenScore,
    isAnswer,
    replayDateValue,
    unplayed,
    replayInsteadOfPenalties,
    forcedWinnerId,
    tech,
    date,
    matchId,
    updateMatchResult,
    createMatch,
    stage.tournamentSeason.tournament,
    stage.tournamentSeason.season,
    stage.stageType,
    host.id,
    guest.id,
  ]);

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <div className={styles.date}>
          <DateInput
            setDate={setDateValue}
            value={dateValue}
            disabled={isCreateLoading || isUpdateLoading}
          />
        </div>
        <div className={styles["available-dates"]}>
          {availableDates?.map((availableDate) => (
            <span
              key={availableDate}
              onClick={() => setDateValue(availableDate)}
              className={classNames(styles["available-date"], {
                [styles["available-date-selected"]]:
                  availableDate === dateValue,
              })}
            >
              {availableDate}
            </span>
          ))}
        </div>
        <div className={styles.answer}>
          {!oneMatch && (
            <Checkbox
              label="Матч-відповідь"
              checked={isAnswer}
              onChange={() => setIsAnswer(!isAnswer)}
              disabled={isNotEmpty(date) || isCreateLoading || isUpdateLoading}
            />
          )}
        </div>
      </div>
      <div className={classNames(styles.container, styles["fixed-results"])}>
        <Checkbox
          label="Матч не був зіграний"
          checked={unplayed}
          onChange={changeUnplayed}
          disabled={isNotEmpty(date) || isCreateLoading || isUpdateLoading}
        />
        <Checkbox
          label="Технічний результат"
          checked={tech}
          onChange={changeTech}
          disabled={isNotEmpty(date) || isCreateLoading || isUpdateLoading}
        />
      </div>
      {unplayed ? (
        <div className={styles.container}>
          {!isAnswer && (
            <Switch
              labelElement={
                <div>
                  Далі йде{" "}
                  {forcedWinnerId === host.id ? (
                    <Club club={host.club} />
                  ) : (
                    <Club club={guest.club} />
                  )}
                </div>
              }
              checked={forcedWinnerId === host.id}
              onChange={changeForceWinner}
              disabled={isCreateLoading || isUpdateLoading}
            />
          )}
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.panel}>
            <NumberInput
              value={hostScore}
              setValue={setHostScore}
              className={styles.input}
              label={<Club club={host.club} />}
              disabled={isCreateLoading || isUpdateLoading}
            />
          </div>
          <div className={styles.panel}>
            <NumberInput
              value={guestScore}
              setValue={setGuestScore}
              className={styles.input}
              label={<Club club={guest.club} />}
              disabled={isCreateLoading || isUpdateLoading}
            />
          </div>
        </div>
      )}
      {showPenaltyBlock && (
        <div className={styles.pen}>
          {unplayed ? (
            <Switch
              labelElement={
                <div>
                  Далі йде{" "}
                  {forcedWinnerId === host.id ? (
                    <Club club={host.club} />
                  ) : (
                    <Club club={guest.club} />
                  )}
                </div>
              }
              checked={forcedWinnerId === host.id}
              onChange={changeForceWinner}
              disabled={isCreateLoading || isUpdateLoading}
            />
          ) : (
            <div className={styles["pen-switcher"]}>
              <Checkbox
                label={
                  replayInsteadOfPenalties
                    ? "Перегравання"
                    : "Післяматчеві пенальті"
                }
                checked={penaltyPart}
                onChange={changePenaltyPart}
                disabled={isCreateLoading || isUpdateLoading}
              />
              {replayInsteadOfPenalties ? (
                <DateInput
                  setDate={setReplayDateValue}
                  value={replayDateValue}
                  disabled={!penaltyPart || isCreateLoading || isUpdateLoading}
                />
              ) : null}
            </div>
          )}
          {penaltyPart && (
            <>
              <div className={styles.container}>
                <div className={styles.panel}>
                  <NumberInput
                    value={hostPenScore}
                    setValue={setHostPenScore}
                    className={styles.input}
                    disabled={isCreateLoading || isUpdateLoading}
                  />
                </div>
                <div className={styles.panel}>
                  <NumberInput
                    value={guestPenScore}
                    setValue={setGuestPenScore}
                    className={styles.input}
                    disabled={isCreateLoading || isUpdateLoading}
                  />
                </div>
              </div>
              {replayInsteadOfPenalties &&
                isNotEmpty(hostPenScore) &&
                isNotEmpty(guestPenScore) &&
                hostPenScore === guestPenScore && (
                  <div className={styles.container}>
                    <Switch
                      labelElement={
                        <div>
                          Переможець за жеребом:
                          {forcedWinnerId === host.id ? (
                            <Club club={host.club} />
                          ) : (
                            <Club club={guest.club} />
                          )}
                        </div>
                      }
                      checked={forcedWinnerId === host.id}
                      onChange={changeForceWinner}
                      disabled={isCreateLoading || isUpdateLoading}
                    />
                  </div>
                )}
            </>
          )}
        </div>
      )}
      <div className={styles.footer}>
        <Button
          text="Зберегти"
          onClick={onSave}
          intent={Intent.PRIMARY}
          disabled={isCreateLoading || isUpdateLoading}
        />
      </div>
    </div>
  );
};

export { ResultForm };
