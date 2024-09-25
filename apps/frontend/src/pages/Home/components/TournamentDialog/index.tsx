import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Intent,
} from "@blueprintjs/core";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  AvailableTournaments,
  StageDto,
  Tournament,
  TournamentSeason,
  Years,
} from "@fbs2.0/types";
import { DateTime } from "luxon";
import {
  _getTournamentTitle,
  isNotEmpty,
  isSeasonLabelValid,
} from "@fbs2.0/utils";
import classNames from "classnames";

import { StageForm } from "../StageForm";
import { EmptyStage } from "../EmptyStage";
import { NumberInput } from "../../../../components/NumberInput";
import { TournamentSelector } from "../../../../components/selectors/TournamentSelector";
import { LoadOrError } from "../../../../components/LoadOrError";
import { useCreateTournament } from "../../../../react-query-hooks/tournament/useCreateTournament";
import { useFetchTournamentStages } from "../../../../react-query-hooks/tournament/useFetchTournamentStages";

import styles from "./styles.module.scss";

interface Props {
  tournament: TournamentSeason | null;
  isOpen: boolean;
  availableTournaments?: AvailableTournaments;
  onClose: () => void;
}

const TournamentDialog: FC<Props> = ({
  isOpen,
  onClose,
  tournament,
  availableTournaments,
}) => {
  const readonly = isNotEmpty(tournament);
  const seasonBoundaries = tournament?.season?.split("-") || [];

  const [copyFromPreviousIsPristine, setCopyFromPreviousIsPristine] =
    useState(true);

  const [startOfSeason, setStartOfSeason] = useState<number>(
    () =>
      (isNotEmpty(seasonBoundaries?.[0])
        ? Number(seasonBoundaries?.[0])
        : undefined) || DateTime.now().get("year") + 1
  );

  const [finishOfSeason, setFinishOfSeason] = useState<number>(
    () =>
      (isNotEmpty(seasonBoundaries?.[1])
        ? Number(seasonBoundaries?.[1])
        : undefined) || DateTime.now().get("year") + 2
  );

  const [tournamentType, setTournamentType] = useState<Tournament | null>(
    () => tournament?.tournament || null
  );

  const [stages, setStages] = useState<StageDto[]>([]);

  const {
    mutate: fetchTournamentStages,
    isLoading,
    isError,
    error: fetchError,
  } = useFetchTournamentStages((stages) => setStages(stages));

  const {
    mutate: createTournament,
    isLoading: isCreating,
    error,
    isError: isCreatingError,
  } = useCreateTournament(() => close());

  const excludedItems = useMemo(
    () =>
      availableTournaments?.[`${startOfSeason}-${finishOfSeason}`]?.map(
        ({ type }) => type
      ) || [],
    [availableTournaments, finishOfSeason, startOfSeason]
  );

  const hasPreviousSeasonTournament = useMemo(
    () =>
      !!availableTournaments?.[
        `${startOfSeason - 1}-${finishOfSeason - 1}`
      ]?.find(({ type }) => tournamentType === type),
    [availableTournaments, finishOfSeason, startOfSeason, tournamentType]
  );

  const isSeasonValid = useMemo(
    () => isSeasonLabelValid(`${startOfSeason}-${finishOfSeason}`, false),
    [finishOfSeason, startOfSeason]
  );

  const isImpossibleToSubmit = useMemo(() => {
    if (
      isLoading ||
      isCreating ||
      isCreatingError ||
      isError ||
      !isNotEmpty(tournamentType)
    ) {
      return true;
    }

    if (
      stages.length < 1 ||
      stages.some(
        ({ stageType, stageSchemeType }) =>
          !isNotEmpty(stageType) || !isNotEmpty(stageSchemeType)
      )
    ) {
      return true;
    }

    return false;
  }, [isCreating, isCreatingError, isError, isLoading, stages, tournamentType]);

  const addStage = useCallback(() => {
    const lastStage = stages.length > 0 ? stages[stages.length - 1] : null;

    setStages([
      ...stages,
      {
        previousStageType: lastStage?.stageType ?? null,
        isStarting: stages.length === 0 ? true : false,
        pen: true,
        awayGoal: false,
      } as StageDto,
    ]);
  }, [stages]);

  const removeStage = useCallback(
    (index: number) => {
      setStages(stages.filter((_, i) => i !== index));
    },
    [stages]
  );

  const insertStage = useCallback(
    (afterIndex: number) => {
      const beforeStages = stages.slice(0, afterIndex + 1);
      const afterStages = stages.slice(afterIndex + 1);
      const previousStage = beforeStages[beforeStages.length - 1];

      setStages([
        ...beforeStages,
        {
          previousStageType: previousStage?.stageType ?? null,
          isStarting: stages.length === 0 ? true : false,
          pen: true,
          awayGoal: false,
        } as StageDto,
        ...afterStages,
      ]);
    },
    [stages]
  );

  const updateStage = useCallback(
    (index: number, stage: StageDto) => {
      const newStages = [...stages];
      newStages[index] = stage;

      if (index + 1 < stages.length) {
        newStages[index + 1].previousStageType = stage.stageType;
      }

      setStages(newStages);
    },
    [stages]
  );

  const close = useCallback(() => {
    setStages([]);
    onClose();
  }, [onClose]);

  const onSubmit = useCallback(() => {
    createTournament({
      season: `${startOfSeason}-${finishOfSeason}`,
      tournament: tournamentType ?? undefined,
      stages,
    });
  }, [createTournament, finishOfSeason, stages, startOfSeason, tournamentType]);

  const copyFromPrevious = useCallback(() => {
    if (!tournamentType) {
      return;
    }

    setCopyFromPreviousIsPristine(false);

    fetchTournamentStages({
      season: `${startOfSeason - 1}-${finishOfSeason - 1}`,
      tournament: tournamentType,
    });
  }, [fetchTournamentStages, finishOfSeason, startOfSeason, tournamentType]);

  useEffect(() => {
    if (stages.length === 0) {
      fetchTournamentStages({
        season: tournament?.season,
        tournament: tournament?.tournament,
      });
    }
  }, [
    fetchTournamentStages,
    stages.length,
    tournament?.season,
    tournament?.tournament,
  ]);

  return (
    <Dialog
      title={
        readonly
          ? _getTournamentTitle(tournament?.season, tournament?.tournament)
          : "Новий турнір"
      }
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      isOpen={isOpen}
      onClose={close}
      className={styles["tournament-dialog"]}
    >
      <DialogBody>
        <LoadOrError
          loading={isLoading || isCreating}
          error={error || fetchError}
        >
          <div className={styles.tournament}>
            <div
              className={classNames(styles.season, {
                [styles.invalid]: !isSeasonValid,
              })}
            >
              <NumberInput
                value={startOfSeason}
                setValue={(value) => {
                  setStartOfSeason(value);

                  const finishOfSeasonValue =
                    tournamentType === Tournament.FAIRS_CUP
                      ? value === 1955
                        ? 1958
                        : value === 1958
                        ? 1960
                        : value + 1
                      : value + 1;

                  setFinishOfSeason(finishOfSeasonValue);
                }}
                min={Years.GLOBAL_START}
                disabled={isNotEmpty(tournament?.id)}
              />
              <NumberInput
                value={finishOfSeason}
                setValue={(value) => {
                  setFinishOfSeason(value);

                  const startOfSeasonValue =
                    tournamentType === Tournament.FAIRS_CUP
                      ? value === 1958
                        ? 1955
                        : value === 1960
                        ? 1958
                        : value - 1
                      : value - 1;

                  setStartOfSeason(startOfSeasonValue);
                }}
                min={startOfSeason}
                disabled={isNotEmpty(tournament?.id)}
              />
            </div>
            <div className={styles.type}>
              <TournamentSelector
                selected={tournamentType}
                onSelect={(type) => {
                  setTournamentType(type);

                  if (!isNotEmpty(tournament?.id) && type === null) {
                    setStages([]);
                  }
                }}
                disabled={isNotEmpty(tournament?.id)}
                year={startOfSeason}
                excludedItems={excludedItems}
              />
            </div>
            {!readonly &&
              hasPreviousSeasonTournament &&
              copyFromPreviousIsPristine && (
                <Button
                  text="Скопіювати стадії з минулорічного турніру"
                  minimal
                  onClick={() => copyFromPrevious()}
                />
              )}
          </div>
          <div className={styles.stages}>
            {stages.map((stage, index) => (
              <StageForm
                key={`${stage.stageType}-${index}`}
                stage={stage}
                first={index === 0}
                last={index === stages.length - 1}
                remove={() => removeStage(index)}
                update={(data) => updateStage(index, data)}
                insert={() => insertStage(index)}
                readonly={readonly}
                startOfSeason={startOfSeason}
              />
            ))}
            {!readonly && (
              <EmptyStage
                onAdd={addStage}
                disabled={!isSeasonValid || !isNotEmpty(tournamentType)}
              />
            )}
          </div>
        </LoadOrError>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            {!readonly && (
              <Button
                intent={Intent.PRIMARY}
                onClick={onSubmit}
                text="Зберегти"
                disabled={isImpossibleToSubmit}
              />
            )}
            <Button intent={Intent.NONE} onClick={close} text="Закрити" />
          </>
        }
      ></DialogFooter>
    </Dialog>
  );
};

export { TournamentDialog };
