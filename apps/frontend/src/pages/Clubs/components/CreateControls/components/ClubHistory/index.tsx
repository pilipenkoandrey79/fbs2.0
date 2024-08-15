import { FC, useCallback, useState } from "react";
import { Button, Classes, Intent, Label } from "@blueprintjs/core";
import { Club, OldClubNameDto } from "@fbs2.0/types";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";

import { NumberInput } from "../../../../../../components/NumberInput";

import styles from "../../../EditForm.module.scss";

interface Props {
  club: Club;
  showForm: boolean;
  setShowForm: (is: boolean) => void;
  createOldClubName: (data: OldClubNameDto) => void;
  deleteOldClubName: (id: number) => void;
}

const ClubHistory: FC<Props> = ({
  club,
  showForm,
  setShowForm,
  createOldClubName,
  deleteOldClubName,
}) => {
  const [name, setName] = useState<string>();
  const [till, setTill] = useState<number>();

  const isSubmitDisabled = !isNotEmpty(till) || !isNotEmpty(name);

  const addOldNameItem = useCallback(() => {
    if (isNotEmpty(till)) {
      if (isSubmitDisabled) {
        return;
      }

      createOldClubName({
        till: `${till}`,
        name: name || "",
        clubId: club.id,
      });

      setName("");
      setTill(undefined);
    }
  }, [club.id, createOldClubName, isSubmitDisabled, name, till]);

  const onRemoveOldNameItem = useCallback(
    (id: number) => {
      if (isNotEmpty(id)) {
        deleteOldClubName(id);
      }
    },
    [deleteOldClubName]
  );

  return (
    <div className={styles.history}>
      <div className={styles["history-header"]}>
        <h4>Історія назв</h4>
        <Button
          icon="plus"
          small
          intent={Intent.PRIMARY}
          onClick={() => {
            setShowForm(true);
          }}
          disabled={showForm}
        />
      </div>
      <ol>
        {[...(club.oldNames || [])]
          .sort((a, b) => Number(a.till) - Number(b.till))
          .map(({ id, name, till }) => (
            <li key={id}>
              <div className={styles["history-item"]}>
                <div className={styles["history-item-value"]}>
                  <b>До:</b>
                  <span>{till}</span>
                </div>
                <div className={styles["history-item-value"]}>
                  <b>Назва:</b>
                  <span>{name}</span>
                </div>
                <Button
                  icon="trash"
                  intent={Intent.DANGER}
                  small
                  minimal
                  onClick={() => onRemoveOldNameItem(id)}
                  disabled={showForm}
                />
              </div>
            </li>
          ))}
      </ol>
      {showForm && (
        <>
          <div className={styles.controls}>
            <Button
              intent={Intent.NONE}
              icon="cross"
              onClick={() => {
                setShowForm(false);
                setTill(undefined);
                setName(undefined);
              }}
              className={styles["old-name-close-button"]}
            />
            <NumberInput
              value={till}
              setValue={setTill}
              label="До"
              className={styles.control}
            />
            <div className={styles.control}>
              <Label>
                Назва
                <input
                  className={classNames(Classes.INPUT, styles.name)}
                  value={name || ""}
                  onChange={(e) => setName(e.target.value)}
                />
              </Label>
            </div>
          </div>
          <Button
            intent={Intent.PRIMARY}
            text="Зберегти"
            onClick={addOldNameItem}
            disabled={isSubmitDisabled}
          />
        </>
      )}
    </div>
  );
};

export { ClubHistory };
