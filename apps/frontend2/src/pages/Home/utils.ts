import { AvailableTournaments } from "@fbs2.0/types";

export const getAvailableSeasonsKeys = (
  availableTournaments: AvailableTournaments | undefined
) =>
  [...Object.keys(availableTournaments || {})].sort(
    (a, b) => Number((a || "").split("-")[0]) - Number((b || "").split("-")[0])
  );

export const getSliderMarks = (
  availableTournaments: AvailableTournaments | undefined,
  granularity = 10
) => {
  const keys = getAvailableSeasonsKeys(availableTournaments);

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
