import { Button, Dialog, Intent, Popover } from "@blueprintjs/core";
import { FC, useState } from "react";
import { City, Club } from "@fbs2.0/types";

import { EditCityForm } from "./components/EditCityForm";
import { EditClubForm } from "./components/EditClubForm";
import { QUERY_KEY } from "../../../../react-query-hooks/query-key";
import { useCreateCity } from "../../../../react-query-hooks/city/useCreateCity";
import { useCreateClub } from "../../../../react-query-hooks/club/useCreateClub";

import styles from "./styles.module.scss";
import popoverStyles from "../../popoverForm.module.scss";

const CreateControls: FC = () => {
  const [isAddClubFormOpen, setIsAddClubFormOpen] = useState(false);
  const [isAddCityFormOpen, setIsAddCityFormOpen] = useState(false);

  const { mutate: createCity } = useCreateCity(
    () => setIsAddCityFormOpen(false),
    [QUERY_KEY.clublessCities]
  );

  const { mutate: createClub } = useCreateClub(
    () => setIsAddClubFormOpen(false),
    [QUERY_KEY.clublessCities]
  );

  return (
    <div className={styles["create-buttons"]}>
      <Button
        icon="plus"
        text="Створити місто"
        intent={Intent.PRIMARY}
        onClick={() => setIsAddCityFormOpen(true)}
      />
      {isAddCityFormOpen && (
        <Dialog
          title="Клуб"
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          isOpen
          onClose={() => setIsAddCityFormOpen(false)}
          className={styles.dialog}
        >
          <EditCityForm city={{} as City} create={createCity} />
        </Dialog>
      )}
      <Popover
        isOpen={isAddClubFormOpen}
        content={
          <div className={popoverStyles["popover-content"]}>
            <Button
              icon="cross"
              small
              minimal
              onClick={() => setIsAddClubFormOpen(false)}
              className={popoverStyles["popover-close-button"]}
            />
            <EditClubForm club={{} as Club} create={createClub} />
          </div>
        }
        hasBackdrop
        placement="bottom-end"
        minimal
      >
        <Button
          icon="plus"
          text="Створити клуб"
          intent={Intent.PRIMARY}
          onClick={() => setIsAddClubFormOpen(true)}
        />
      </Popover>
    </div>
  );
};

export { CreateControls };
