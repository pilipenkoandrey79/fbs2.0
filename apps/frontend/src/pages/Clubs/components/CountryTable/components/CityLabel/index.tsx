import { Button, Dialog, Intent, Popover } from "@blueprintjs/core";
import { City } from "@fbs2.0/types";
import { FC, useContext, useState } from "react";

import { EditCityForm } from "../../../CreateControls/components/EditCityForm";
import { UserContext } from "../../../../../../context/userContext";
import { useUpdateCity } from "../../../../../../react-query-hooks/city/useUpdateCity";
import { QUERY_KEY } from "../../../../../../react-query-hooks/query-key";
import { useDeleteCity } from "../../../../../../react-query-hooks/city/useDeleteCity";
import { useCreateCityOldName } from "../../../../../../react-query-hooks/city/useCreateCityOldName";
import { useDeleteCityOldName } from "../../../../../../react-query-hooks/city/useDeleteCityOldName";

import styles from "../../../../popoverForm.module.scss";

const queryKeys = [QUERY_KEY.clublessCities, QUERY_KEY.clubs];

interface Props {
  city: City;
  removable?: boolean;
}

const CityLabel: FC<Props> = ({ city, removable = true }) => {
  const { user } = useContext(UserContext);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const { mutate: updateCity } = useUpdateCity(
    () => setIsEditorOpen(false),
    queryKeys
  );

  const { mutate: createCityOldName } = useCreateCityOldName(queryKeys);
  const { mutate: deleteOldCityName } = useDeleteCityOldName(queryKeys);

  const { mutate: deleteCity } = useDeleteCity(
    () => setIsRemoveOpen(false),
    queryKeys
  );

  return (
    <>
      {city.name}{" "}
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
          title="Місто"
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          isOpen
          onClose={() => setIsEditorOpen(false)}
          className={styles.dialog}
        >
          <EditCityForm
            city={city}
            update={updateCity}
            createOldCityName={createCityOldName}
            deleteOldCityName={deleteOldCityName}
          />
        </Dialog>
      )}
      {removable && user?.isEditor && (
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
                  <p>Видалити місто?</p>
                </div>
                <div className={styles["remove-block-footer"]}>
                  <Button
                    text="Видалити"
                    intent={Intent.DANGER}
                    onClick={() => deleteCity(city)}
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
    </>
  );
};

export { CityLabel };
