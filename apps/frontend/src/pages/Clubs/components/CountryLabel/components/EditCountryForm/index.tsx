import {
  Button,
  Classes,
  DialogBody,
  DialogFooter,
  Intent,
  Label,
} from "@blueprintjs/core";
import { Country } from "@fbs2.0/types";
import { FC, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { isNotEmpty } from "@fbs2.0/utils";

import { NumberInput } from "../../../../../../components/NumberInput";

import styles from "../../../EditForm.module.scss";

interface Props {
  country: Country;
  save: (country: Partial<Country>) => void;
}

const EditCountryForm: FC<Props> = ({ country, save }) => {
  const [name, setName] = useState<string>();
  const [from, setFrom] = useState<number>();
  const [till, setTill] = useState<number>();

  const isSubmitDisabled = !isNotEmpty(name) || name === country?.name;

  const onSubmit = useCallback(() => {
    const payload: Partial<Country> = { id: country.id };

    if (isNotEmpty(name)) {
      payload.name = name;
    }

    if (isNotEmpty(from)) {
      payload.from = `${from}`;
    }

    if (isNotEmpty(till)) {
      payload.till = `${till}`;
    }

    save(payload);
  }, [country.id, from, name, save, till]);

  useEffect(() => {
    setName(country.name);
    setFrom(isNotEmpty(country.from) ? Number(country.from) : undefined);
    setTill(isNotEmpty(country.till) ? Number(country.till) : undefined);
  }, [country.from, country.name, country.till]);

  return (
    <>
      <DialogBody className={styles.controls}>
        <div className={styles.control}>{country.id || "#"}</div>
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
        <NumberInput
          value={from}
          setValue={setFrom}
          label="З"
          className={styles.control}
        />
        <NumberInput
          value={till}
          setValue={setTill}
          label="По"
          className={styles.control}
        />
      </DialogBody>
      <DialogFooter>
        <Button
          intent={Intent.PRIMARY}
          text="Зберегти"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
        />
      </DialogFooter>
    </>
  );
};

export { EditCountryForm };
