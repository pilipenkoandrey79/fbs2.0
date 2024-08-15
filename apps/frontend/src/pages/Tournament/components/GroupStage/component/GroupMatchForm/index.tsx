import { FC, useCallback, useState } from "react";
import { Button, Checkbox, Intent } from "@blueprintjs/core";
import {
  MatchDto,
  Participant,
  Group as GroupName,
  BaseMatch,
  MatchResultDto,
  Stage,
} from "@fbs2.0/types";
import { getPointsToSubtract, isNotEmpty } from "@fbs2.0/utils";
import classNames from "classnames";

import { DateInput } from "../../../../../../components/DateInput";
import { NumberInput } from "../../../../../../components/NumberInput";
import { ParticipantSelector } from "../../../../../../components/selectors/ParticipantSelector";
import { GroupMatchCombination } from "../../../../types";
import { useCreateMatch } from "../../../../../../react-query-hooks/matches/useCreateMatch";
import { useUpdateMatchResult } from "../../../../../../react-query-hooks/matches/useUpdateMatchResult";
import { useDeleteMatch } from "../../../../../../react-query-hooks/matches/useDeleteMatch";

import styles from "./styles.module.scss";

interface Props {
  match?: BaseMatch;
  stage: Stage;
  participants: Participant[];
  name: GroupName;
  toursRange?: number[];
  defaultDate?: string;
  availableCombinations?: GroupMatchCombination[];
  saveCallback: () => void;
}

const GroupMatchForm: FC<Props> = ({
  saveCallback,
  participants,
  name,
  match,
  toursRange,
  defaultDate,
  stage,
  availableCombinations,
}) => {
  const [date, setDate] = useState<string | null>(
    () => match?.date || defaultDate || null
  );

  const [tour, setTour] = useState(() => match?.tour || toursRange?.[0] || 1);

  const [hostId, setHostId] = useState<number | null>(
    () => match?.host.id || null
  );

  const [guestId, setGuestId] = useState<number | null>(
    () => match?.guest.id || null
  );

  const [result, setResult] = useState(true);
  const [tech, setTech] = useState(() => !!match?.tech);

  const [hasDeduction, setHasDeduction] = useState(
    () => (match?.deductedPointsList?.length || 0) > 0
  );

  const [hostScore, setHostScore] = useState<number>(
    () => match?.hostScore ?? 0
  );

  const [guestScore, setGuestScore] = useState<number>(
    () => match?.guestScore ?? 0
  );

  const [hostDeduction, setHostDeduction] = useState(() =>
    getPointsToSubtract(match?.deductedPointsList || [], match?.host.id)
  );

  const [guestDeduction, setGuestDeduction] = useState(() =>
    getPointsToSubtract(match?.deductedPointsList || [], match?.guest.id)
  );

  const { mutate: createMatch, isLoading: isCreateLoading } =
    useCreateMatch(saveCallback);

  const { mutate: updateMatchResult, isLoading: isUpdateLoading } =
    useUpdateMatchResult(saveCallback);

  const { mutate: deleteMatch } = useDeleteMatch(saveCallback);

  const applyCombination = useCallback((combination: GroupMatchCombination) => {
    setHostId(combination.host.id);
    setGuestId(combination.guest.id);
  }, []);

  const changeTech = useCallback(() => {
    const newValue = !tech;

    setHostScore(newValue ? 3 : 0);
    setGuestScore(0);
    setTech(newValue);
  }, [tech]);

  const onSave = useCallback(() => {
    if (hostId === null || guestId === null) {
      return;
    }

    const payload = {
      hostScore: result ? hostScore : undefined,
      guestScore: result ? guestScore : undefined,
    } as MatchDto;

    if (hasDeduction && (hostDeduction > 0 || guestDeduction > 0)) {
      payload.deductions = [
        { participantId: hostId, points: hostDeduction },
        { participantId: guestId, points: guestDeduction },
      ].filter(({ points }) => points > 0);
    }

    if (!isNotEmpty(match)) {
      payload.hostId = hostId;
      payload.guestId = guestId;
      payload.stageType = stage.stageType;
      payload.answer = false;
      payload.date = date ?? "";
      payload.group = name;
      payload.tour = tour;
      payload.tech = tech;
    }

    return isNotEmpty(match?.id)
      ? updateMatchResult({
          id: match?.id as number,
          payload: payload as MatchResultDto,
        })
      : createMatch({
          tournament: stage.tournamentSeason.tournament,
          season: stage.tournamentSeason.season,
          matchDto: payload,
        });
  }, [
    hostId,
    guestId,
    result,
    hostScore,
    guestScore,
    hasDeduction,
    hostDeduction,
    guestDeduction,
    match,
    updateMatchResult,
    createMatch,
    stage.tournamentSeason.tournament,
    stage.tournamentSeason.season,
    stage.stageType,
    date,
    name,
    tour,
    tech,
  ]);

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <div className={styles.date}>
          <DateInput
            setDate={setDate}
            value={date}
            disabled={isNotEmpty(match) || isCreateLoading || isUpdateLoading}
          />
        </div>
        {isNotEmpty(match) && (
          <Button
            icon="trash"
            onClick={() =>
              !!match &&
              deleteMatch({
                onlyResults: false,
                match: {
                  host: match.host,
                  guest: match.guest,
                  id: match.id,
                },
              })
            }
            minimal
            intent={Intent.DANGER}
          />
        )}
      </div>
      <div className={styles.container}>
        <div className={styles.tour}>
          <NumberInput
            value={tour}
            setValue={setTour}
            max={toursRange?.[1] || 6}
            min={toursRange?.[0] || 1}
            disabled={isNotEmpty(match) || isCreateLoading || isUpdateLoading}
          />
        </div>
        <div className={styles.participants}>
          <div className={styles.combinations}>
            {availableCombinations?.map((combination) => (
              <span
                key={`${combination.host.id}-${combination.guest.id}`}
                onClick={() => applyCombination(combination)}
                className={classNames(styles.combination, {
                  [styles["combination-selected"]]:
                    combination.host.id === hostId &&
                    combination.guest.id === guestId,
                })}
              >
                {combination.host.club.name}-{combination.guest.club.name}
              </span>
            ))}
          </div>
          <div className={styles["participants-selectors"]}>
            <ParticipantSelector
              participants={participants.filter(({ id }) => id !== guestId)}
              onSelect={setHostId}
              className={styles.participant}
              selectedItemId={hostId ?? undefined}
              disabled={
                isNotEmpty(match?.host.id) || isCreateLoading || isUpdateLoading
              }
            />
            <ParticipantSelector
              participants={participants.filter(({ id }) => id !== hostId)}
              onSelect={setGuestId}
              className={styles.participant}
              selectedItemId={guestId ?? undefined}
              disabled={
                isNotEmpty(match?.guest.id) ||
                isCreateLoading ||
                isUpdateLoading
              }
            />
          </div>
        </div>
      </div>
      <div className={styles.result}>
        <div className={styles.checkbox}>
          <Checkbox
            label="Ввести результат"
            checked={result}
            onChange={() => setResult(!result)}
            disabled={isCreateLoading || isUpdateLoading}
          />
        </div>
        <div className={styles.checkbox}>
          <Checkbox
            label="Технічний результат"
            checked={tech}
            onChange={changeTech}
            disabled={isCreateLoading || isUpdateLoading}
          />
        </div>
        {result && (
          <>
            <div className={styles.scores}>
              <div className={styles.participant}>
                <NumberInput
                  value={hostScore}
                  setValue={setHostScore}
                  disabled={isCreateLoading || isUpdateLoading}
                />
              </div>
              <div className={styles.participant}>
                <NumberInput
                  value={guestScore}
                  setValue={setGuestScore}
                  disabled={isCreateLoading || isUpdateLoading}
                />
              </div>
            </div>
            <div className={styles.checkbox}>
              <Checkbox
                label="Покарано зняттям очок"
                checked={hasDeduction}
                onChange={() => setHasDeduction(!hasDeduction)}
                disabled={isCreateLoading || isUpdateLoading}
              />
            </div>
            {hasDeduction && (
              <div className={styles.scores}>
                <div className={styles.participant}>
                  <NumberInput
                    value={hostDeduction}
                    setValue={setHostDeduction}
                    disabled={isCreateLoading || isUpdateLoading}
                  />
                </div>
                <div className={styles.participant}>
                  <NumberInput
                    value={guestDeduction}
                    setValue={setGuestDeduction}
                    disabled={isCreateLoading || isUpdateLoading}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <Button
          text="Зберегти"
          onClick={onSave}
          intent={Intent.PRIMARY}
          disabled={
            !isNotEmpty(hostId) ||
            !isNotEmpty(guestId) ||
            !isNotEmpty(date, true) ||
            isCreateLoading ||
            isUpdateLoading
          }
        />
      </div>
    </div>
  );
};

export { GroupMatchForm };
