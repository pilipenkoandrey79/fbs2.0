import { Participant, Stage } from "@fbs2.0/types";
import { FC } from "react";

import { Club } from "../../../../../../components/Club";
import { applyStageSubstitutions } from "../../../../utils";

interface Props {
  stage: Stage;
  participant: Participant;
  className?: string;
}

const getSubstitution = (participant: Participant, stage: Stage) => {
  const [substitution] = applyStageSubstitutions(
    [participant],
    stage.stageSubstitutions || []
  );

  return substitution.id !== participant.id ? substitution : undefined;
};

const StageParticipant: FC<Props> = ({ stage, participant, className }) => {
  const substitution = getSubstitution(participant, stage);

  return (
    <li>
      <Club
        club={participant.club}
        expelled={!!substitution}
        className={className}
      />
      {substitution && <Club club={substitution.club} />}
    </li>
  );
};

export { StageParticipant };
