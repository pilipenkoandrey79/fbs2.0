import {
  AvailableTournaments,
  GROUP_STAGES,
  StageSchemeType,
  StageType,
} from "@fbs2.0/types";

export const DEFAULT_MIN_SLIDER_VALUE = 2020;

export const getSliderMarks = (
  availableTournaments: AvailableTournaments | undefined,
  granularity = 10
) => {
  const keys = Object.keys(availableTournaments || {});

  if (keys.length < 1) {
    return { min: 0, max: 0, marks: {} };
  }

  const min = Number(keys[0].split("-")[0]) || 0;
  const max = new Date().getFullYear() + 1 || 0;

  return {
    min,
    max,
    marks: new Array(Math.ceil((max - min) / granularity))
      .fill(1)
      .map((_, index) => index * granularity + min)
      .reduce((acc, mark) => ({ ...acc, [mark]: `${mark}` }), {}),
  };
};

export const getDefaultSchemeByType = (stageType: StageType) => {
  switch (stageType) {
    case StageType.PRE_QUALIFY_HALF:
    case StageType.PRE_QUALIFY_FINAL:
    case StageType.FINAL:
      return StageSchemeType.OLYMPIC_1_MATCH;
    case StageType.FIRST_QUALIFY:
    case StageType.SECOND_QUALIFY:
    case StageType.THIRD_QUALIFY:
    case StageType.PRE_ROUND:
    case StageType.PLAYOFF:
    case StageType.KNOCKOUT_PLAYOFF:
    case StageType.FIRST_ROUND:
    case StageType.SECOND_ROUND:
    case StageType.THIRD_ROUND:
    case StageType.ROUND_16:
    case StageType.QUARTER_FINAL:
    case StageType.SEMI_FINAL:
      return StageSchemeType.OLYMPIC_2_MATCH;
    case StageType.LEAGUE:
      return StageSchemeType.LEAGUE;
    case StageType.GROUP:
    case StageType.GROUP_2:
      return StageSchemeType.GROUP_4_2_MATCH;
  }
};

export const isOlimpic = (stageSchemeType: StageSchemeType) =>
  !isGroup(stageSchemeType) && stageSchemeType !== StageSchemeType.LEAGUE;

export const isGroup = (stageSchemeType: StageSchemeType) =>
  GROUP_STAGES.includes(stageSchemeType);
