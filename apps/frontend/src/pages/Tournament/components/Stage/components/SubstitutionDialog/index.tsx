import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Intent,
} from "@blueprintjs/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StageSubstitutionDto,
  StageSubstitution,
  ApiEntities,
  Participant,
} from "@fbs2.0/types";
import { FC, useState } from "react";
import { isNotEmpty } from "@fbs2.0/utils";

import ApiClient from "../../../../../../api/api.client";
import {
  successNotification,
  showError,
} from "../../../../../../components/Toaster/utils";
import { ParticipantSelector } from "../../../../../../components/selectors/ParticipantSelector";
import { QUERY_KEY } from "../../../../../../react-query-hooks/query-key";

interface Props {
  stageId: number;
  stageParticipants: Participant[];
  allParticipants: Participant[];
  onClose: () => void;
}

const SubstitutionDialog: FC<Props> = ({
  onClose,
  stageId,
  stageParticipants,
  allParticipants,
}) => {
  const [expelledId, setExpelledId] = useState<number>();
  const [subId, setSubId] = useState<number>();

  const subs = allParticipants.filter(
    ({ id }) =>
      !stageParticipants.find((stageParticipant) => stageParticipant.id === id)
  );

  const queryClient = useQueryClient();

  const createSubstitution = useMutation(
    () => {
      if (!isNotEmpty(expelledId) || !isNotEmpty(subId)) {
        return Promise.reject();
      }

      const substitution: StageSubstitutionDto = {
        stageId,
        expelledId: expelledId as number,
        subId: subId as number,
      };

      return ApiClient.getInstance().post<
        StageSubstitution,
        StageSubstitutionDto
      >(`${ApiEntities.Tournament}/create-stage-substitution`, substitution);
    },
    {
      onSuccess: () => {
        successNotification("Замінено учасника");
      },
      onError: (e: unknown) => {
        showError(e as Error);
      },
      onSettled: () => {
        onClose();
        queryClient.invalidateQueries([QUERY_KEY.matches]);
      },
    }
  );

  return (
    <Dialog
      title="Заміна учасника"
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      isOpen
      onClose={onClose}
    >
      <DialogBody>
        Замінити{" "}
        <ParticipantSelector
          participants={stageParticipants}
          onSelect={setExpelledId}
        />{" "}
        на <ParticipantSelector participants={subs} onSelect={setSubId} />
      </DialogBody>
      <DialogFooter>
        <Button
          intent={Intent.PRIMARY}
          onClick={() => createSubstitution.mutate()}
          text="Зберегти"
        />
      </DialogFooter>
    </Dialog>
  );
};

export { SubstitutionDialog };
