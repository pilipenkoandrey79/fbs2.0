import { Participant, Stage } from "@fbs2.0/types";
import { FC } from "react";

import { applyStageSubstitutions } from "../../utils";
import { Club } from "../../../../../../../../components/Club";

interface Props {
  stage: Stage;
  participant: Participant;
  className?: string;
}

const getSubstitution = (participant: Participant, stage: Stage) => {
  const [substitution] =
    applyStageSubstitutions([participant], stage.stageSubstitutions) || [];

  return substitution.id !== participant.id ? substitution : undefined;
};

const StageParticipant: FC<Props> = ({ stage, participant, className }) => {
  const substitution = getSubstitution(participant, stage);

  return (
    <>
      <Club
        club={participant.club}
        expelled={!!substitution}
        className={className}
      />
      {substitution && <Club club={substitution.club} />}
    </>
  );
};

export { StageParticipant };
