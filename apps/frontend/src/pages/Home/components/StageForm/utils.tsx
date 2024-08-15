import {
  GROUP_STAGES,
  Stage,
  StageDto,
  StageSchemeType,
  StageType,
} from "@fbs2.0/types";
import { isNotEmpty } from "@fbs2.0/utils";

export const stages = Object.values(StageType).map(
  (type) => ({ stageType: type } as Stage)
);

export const isStartingChecked = (
  stageType: StageType | undefined | null,
  first: boolean
) => {
  if (first) {
    return true;
  }

  if (
    isNotEmpty(stageType) &&
    [
      StageType.PRE_QUALIFY_HALF,
      StageType.PRE_ROUND,
      StageType.FIRST_QUALIFY,
      StageType.SECOND_QUALIFY,
      StageType.THIRD_QUALIFY,
      StageType.PLAYOFF,
      StageType.GROUP,
      StageType.LEAGUE,
    ].includes(stageType as StageType)
  ) {
    return true;
  }

  return false;
};

export const isOlimpic = (stage: StageDto) =>
  !isGroup(stage) && stage.stageSchemeType !== StageSchemeType.LEAGUE;

export const isGroup = (stage: StageDto) =>
  GROUP_STAGES.includes(stage.stageSchemeType);

export const getDefaultScheme = (stageType: StageType | undefined | null) => {
  if (!isNotEmpty(stageType)) {
    return null;
  }

  if (stageType === StageType.LEAGUE) {
    return StageSchemeType.LEAGUE;
  }

  if (stageType === StageType.GROUP || stageType === StageType.GROUP_2) {
    return StageSchemeType.GROUP_4_2_MATCH;
  }

  if (
    [
      StageType.FIRST_QUALIFY,
      StageType.SECOND_QUALIFY,
      StageType.THIRD_QUALIFY,
      StageType.PRE_ROUND,
      StageType.PLAYOFF,
      StageType.KNOCKOUT_PLAYOFF,
      StageType.FIRST_ROUND,
      StageType.SECOND_ROUND,
      StageType.THIRD_ROUND,
      StageType.ROUND_16,
      StageType.QUARTER_FINAL,
      StageType.SEMI_FINAL,
    ].includes(stageType as StageType)
  ) {
    return StageSchemeType.OLYMPIC_2_MATCH;
  }

  if (
    [
      StageType.PRE_QUALIFY_HALF,
      StageType.PRE_QUALIFY_FINAL,
      StageType.FINAL,
    ].includes(stageType as StageType)
  ) {
    return StageSchemeType.OLYMPIC_1_MATCH;
  }

  return null;
};
