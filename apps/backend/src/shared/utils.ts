import { Stage } from "@fbs2.0/types";
import * as bcrypt from "bcrypt";

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
