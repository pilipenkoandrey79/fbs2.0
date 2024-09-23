import { Button, Dialog, Intent, Popover } from "@blueprintjs/core";
import { Club } from "@fbs2.0/types";
import { FC, useContext, useState } from "react";

import { EditClubForm } from "../../../CreateControls/components/EditClubForm";
import { UserContext } from "../../../../../../context/userContext";
import { QUERY_KEY } from "../../../../../../react-query-hooks/query-key";
import { useUpdateClub } from "../../../../../../react-query-hooks/club/useUpdateClub";
import { useDeleteClub } from "../../../../../../react-query-hooks/club/useDeleteClub";
import { useCreateClubOldName } from "../../../../../../react-query-hooks/club/useCreateClubOldName";
import { useDeleteClubOldName } from "../../../../../../react-query-hooks/club/useDeleteClubOldName";

import styles from "../../../../popoverForm.module.scss";

const queryKeys = [QUERY_KEY.clublessCities];

interface Props {
  club: Club;
  onSelect: () => void;
}

const ClubLabel: FC<Props> = ({ club, onSelect }) => {
  const { user } = useContext(UserContext);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const { mutate: updateClub } = useUpdateClub(
    () => setIsEditorOpen(false),
    queryKeys
  );

  const { mutate: createClubOldName } = useCreateClubOldName(queryKeys);
  const { mutate: deleteClubOldName } = useDeleteClubOldName(queryKeys);

  const { mutate: deleteClub } = useDeleteClub(
    () => setIsRemoveOpen(false),
    queryKeys
  );

  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span className={styles["club-name"]} onClick={onSelect}>
        {club.name}{" "}
      </span>
      {user?.isEditor && (
        <Button
          icon="edit"
          small
          minimal
          onClick={() => setIsEditorOpen(true)}
        />
      )}
      {isEditorOpen && (
        <Dialog
          title="Клуб"
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          isOpen
          onClose={() => setIsEditorOpen(false)}
          className={styles.dialog}
        >
          <EditClubForm
            club={club}
            update={updateClub}
            createOldClubName={createClubOldName}
            deleteOldClubName={deleteClubOldName}
          />
        </Dialog>
      )}
      {user?.isEditor && (
        <Popover
          isOpen={isRemoveOpen}
          content={
            <div className={styles["popover-content"]}>
              <Button
                icon="cross"
                small
                minimal
                onClick={() => setIsRemoveOpen(false)}
                className={styles["popover-close-button"]}
              />
              <div className={styles["remove-block"]}>
                <div className={styles["remove-block-content"]}>
                  <p>Видалити клуб?</p>
                </div>
                <div className={styles["remove-block-footer"]}>
                  <Button
                    text="Видалити"
                    intent={Intent.DANGER}
                    onClick={() => deleteClub(club)}
                  />
                </div>
              </div>
            </div>
          }
        >
          <Button
            icon="trash"
            intent={Intent.DANGER}
            small
            minimal
            onClick={() => setIsRemoveOpen(true)}
          />
        </Popover>
      )}
    </span>
  );
};

export { ClubLabel };
