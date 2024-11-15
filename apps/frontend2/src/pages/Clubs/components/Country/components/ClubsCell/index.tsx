import { Club as ClubInterface } from "@fbs2.0/types";
import { FC, useState } from "react";
import classNames from "classnames";
import { Button } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import { Club } from "../../../../../../components/Club";
import { CVInput } from "../CV";
import { ClubDialog } from "../ClubDialog";

import styles from "./styles.module.scss";

interface Props {
  clubs: ClubInterface[];
  countryId: number | undefined;
  cityId: number | undefined;
  cvInput: CVInput | null;
  setCvInput: (input: CVInput) => void;
}

const ClubsCell: FC<Props> = ({
  clubs,
  countryId,
  cityId,
  cvInput,
  setCvInput,
}) => {
  const [clubIdToEdit, setClubIdToEdit] = useState<number | null>(null);

  return (
    <>
      <ul className={styles.clubs}>
        {clubs.map((club) => (
          <li key={club.id} className={styles["clubs-item"]}>
            <span
              className={classNames(styles.club, {
                [styles.active]:
                  cvInput?.type === "club" && cvInput.id === club.id,
              })}
              onClick={() => {
                setCvInput({ type: "club", id: club.id });
              }}
            >
              <Club club={club} showCity={false} showCountry={false} />
            </span>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              className={styles["edit-button"]}
              onClick={() => setClubIdToEdit(club.id)}
            />
          </li>
        ))}
      </ul>
      <Button
        icon={<PlusOutlined />}
        size="small"
        type="primary"
        className={styles["plus-button"]}
        onClick={() => setClubIdToEdit(-1)}
      />
      {clubIdToEdit !== null && (
        <ClubDialog
          id={clubIdToEdit}
          countryId={countryId}
          cityId={cityId}
          onClose={() => setClubIdToEdit(null)}
        />
      )}
    </>
  );
};

export { ClubsCell };
