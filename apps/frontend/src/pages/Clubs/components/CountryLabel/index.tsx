import { Button, Dialog } from "@blueprintjs/core";
import { Country } from "@fbs2.0/types";
import { FC, useContext, useState } from "react";

import { EditCountryForm } from "./components/EditCountryForm";
import { UserContext } from "../../../../context/userContext";
import { useUpdateCountry } from "../../../../react-query-hooks/country/useUpdateCountry";

import styles from "../../popoverForm.module.scss";

interface Props {
  country: Country;
  onSelect: () => void;
  oldCountry?: boolean;
}

const CountryLabel: FC<Props> = ({ country, onSelect, oldCountry = false }) => {
  const { user } = useContext(UserContext);

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { mutate: updateCountry } = useUpdateCountry();

  return (
    <>
      <span className={styles["country-name"]} onClick={onSelect}>
        {country.name}
      </span>
      {user?.isEditor && !oldCountry && (
        <Button
          icon="edit"
          small
          minimal
          onClick={() => setIsEditorOpen(true)}
        />
      )}
      {isEditorOpen && (
        <Dialog
          title="Країна"
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          isOpen
          onClose={() => setIsEditorOpen(false)}
          className={styles.dialog}
        >
          <EditCountryForm country={country} save={updateCountry} />
        </Dialog>
      )}
    </>
  );
};

export { CountryLabel };
