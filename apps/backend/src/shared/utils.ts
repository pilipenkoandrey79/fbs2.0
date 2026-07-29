import { Stage } from "@fbs2.0/types";
import { JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

/**
 * Normalizes a JWT expiration time coming from the environment.
 *
 * `expiresIn` accepts either a number of seconds (`200`) or an `ms`-style
 * duration string (`"200s"`, `"1h"`, `"7d"`), so the raw value must not be
 * blindly passed through `Number()` — that turns every valid duration string
 * into `NaN` and makes token signing fail.
 */
export const parseExpirationTime = (
  expirationTime: string | undefined,
): NonNullable<JwtSignOptions["expiresIn"]> => {
  const value = expirationTime?.trim();

  if (!value) {
    throw new Error("JWT expiration time is not configured");
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds)) {
    return seconds;
  }

  return value as NonNullable<JwtSignOptions["expiresIn"]>;
};

export const hashData = async (data: string): Promise<string> => {
  const saltRounds = 10;

  return bcrypt.hash(data, saltRounds);
};

export const validateHashedData = async (
  toValidateHashedData: string,
  primaryHashedData: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(toValidateHashedData, primaryHashedData);
  } catch (e) {
    console.log(e);
  }
};

const arrangeStages = (
  sequencedStagesList: Stage[],
  stages: Stage[],
  previousStageId: number | null
): Stage[] => {
  const nextStage =
    previousStageId === null
      ? stages.find(({ previousStage }) => previousStage === null)
      : stages.find(
          ({ previousStage }) =>
            previousStage !== null && previousStageId === previousStage.id
        );

  if (!nextStage) {
    return sequencedStagesList;
  }

  sequencedStagesList.push(nextStage);

  return arrangeStages(sequencedStagesList, stages, nextStage.id);
};

export const getSecuencedStagesList = (stages: Stage[]) => {
  return arrangeStages([], stages, null);
};
