import { FC, useCallback, useState } from "react";
import { Button, Card, Checkbox, Intent, Switch } from "@blueprintjs/core";
import {
  DEFAULT_GROUPS_QUANTITY,
  DEFAULT_SWISS_LENGTH,
  GROUP_STAGES,
  ONE_MATCH_STAGES,
  StageDto,
  StageSchemeType,
} from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";

import { StageTypeSelector } from "../../../../components/selectors/StageTypeSelector";
import { StageSchemeTypeSelector } from "../../../../components/selectors/StageSchemeTypeSelector";
import { TournamentSelector } from "../../../../components/selectors/TournamentSelector";
import { NumberInput } from "../../../../components/NumberInput";
import {
  getDefaultScheme,
  isGroup,
  isOlimpic,
  isStartingChecked,
  stages,
} from "./utils";

import styles from "./styles.module.scss";

interface Props {
  stage: StageDto;
  first?: boolean;
  last?: boolean;
  readonly: boolean;
  startOfSeason: number | string;

  remove: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  insert: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  update: (stage: StageDto) => void;
}

const StageForm: FC<Props> = ({
  stage,
  first = false,
  last = false,
  readonly,
  startOfSeason,
  remove,
  update,
  insert,
}) => {
  const [isLinkedTournamentOn, setIsLinkedTournamentOn] = useState(
    () => isNotEmpty(stage.linkedTournament) && isNotEmpty(stage.linkedStage)
  );

  const changeField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (field: keyof StageDto, value: any) => {
      const newStage = { ...stage, [field]: value };

      if (field === "stageType") {
        const stageSchemeType = getDefaultScheme(value);

        if (isNotEmpty(stageSchemeType)) {
          newStage.stageSchemeType = stageSchemeType as StageSchemeType;
        }
      }

      if (field === "stageSchemeType") {
        if (GROUP_STAGES.includes(value)) {
          newStage.groups = DEFAULT_GROUPS_QUANTITY;
        } else {
          delete newStage.groups;
        }
      }

      update(newStage);
    },
    [stage, update]
  );

  const changeLinkedTournamentCheckbox = useCallback(() => {
    const newValue = !isLinkedTournamentOn;

    if (!newValue) {
      changeField("linkedTournament", null);
      changeField("linkedStage", null);
    }

    setIsLinkedTournamentOn(newValue);
  }, [changeField, isLinkedTournamentOn]);

  return (
    <Card className={styles.stage}>
      {!readonly && (
        <Button
          icon="trash"
          className={styles["remove-icon"]}
          onClick={remove}
          minimal
          intent={Intent.DANGER}
        />
      )}
      <div className={styles.type}>
        <StageTypeSelector
          stages={stages}
          selectedStageType={stage.stageType || null}
          onSelect={(value) => changeField("stageType", value)}
          disabled={readonly}
        />
        <Checkbox
          label="Учасники можуть стартувати з цієї стадії"
          checked={
            isNotEmpty(stage.isStarting)
              ? !!stage.isStarting
              : isStartingChecked(stage.stageType, first)
          }
          onChange={() => changeField("isStarting", !stage.isStarting)}
          className={styles["is-starting"]}
          disabled={readonly}
        />
      </div>
      <div className={styles.scheme}>
        <StageSchemeTypeSelector
          onSelect={(value) => changeField("stageSchemeType", value)}
          selected={stage.stageSchemeType || getDefaultScheme(stage.stageType)}
          disabled={readonly}
        />
        {isOlimpic(stage) && (
          <>
            <Switch
              label="Додатковий матч замість післяматчевих пенальті"
              checked={!stage.pen}
              onChange={() => changeField("pen", !stage.pen)}
              className={styles["pen-switcher"]}
              disabled={readonly}
            />
            {!ONE_MATCH_STAGES.includes(stage.stageSchemeType) && (
              <Switch
                label="Правило виїзного гола"
                checked={!!stage.awayGoal}
                onChange={() => changeField("awayGoal", !stage.awayGoal)}
                className={styles["pen-switcher"]}
                disabled={readonly}
              />
            )}
          </>
        )}
        {isGroup(stage) && (
          <div className={styles.groups}>
            <p>Кількість груп: </p>
            <NumberInput
              value={stage.groups || DEFAULT_GROUPS_QUANTITY}
              setValue={(value) => changeField("groups", value)}
              disabled={readonly}
            />
          </div>
        )}
        {stage.stageSchemeType === StageSchemeType.LEAGUE && (
          <div className={styles.swiss}>
            <p>Кількість команд: </p>
            <NumberInput
              value={stage.swissNum || DEFAULT_SWISS_LENGTH}
              setValue={(value) => changeField("swissNum", value)}
              disabled={readonly}
            />
            <p>Кількість турів: </p>
            <NumberInput
              value={stage.swissTours || DEFAULT_SWISS_LENGTH / 4 - 1}
              setValue={(value) => changeField("swissTours", value)}
              disabled={readonly}
            />
          </div>
        )}
      </div>
      <div className={styles["another-tournament"]}>
        <Checkbox
          label="З цієї стадії учасники вилітають до іншого турніру"
          checked={isLinkedTournamentOn}
          onChange={changeLinkedTournamentCheckbox}
          disabled={readonly}
        />
        {isLinkedTournamentOn && (
          <div className={styles["tournament-selection"]}>
            <TournamentSelector
              selected={stage.linkedTournament || null}
              onSelect={(value) => changeField("linkedTournament", value)}
              disabled={readonly}
              year={startOfSeason}
            />
            <StageTypeSelector
              stages={stages}
              selectedStageType={stage.linkedStage || null}
              onSelect={(value) => changeField("linkedStage", value)}
              disabled={readonly}
            />
          </div>
        )}
      </div>
      {!last && !readonly && (
        <Button
          icon="plus"
          small
          className={styles["insert-button"]}
          onClick={insert}
        />
      )}
    </Card>
  );
};

export { StageForm };
