import { AvailableTournaments } from "@fbs2.0/types";

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
