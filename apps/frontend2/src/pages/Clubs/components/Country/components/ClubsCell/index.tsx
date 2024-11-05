import { Club as ClubInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";

import { Club } from "../../../../../../components/Club";
import { CVInput } from "../CV";

import styles from "./styles.module.scss";

interface Props {
  clubs: ClubInterface[];
  cvInput: CVInput | null;
  setCvInput: (input: CVInput) => void;
}

const ClubsCell: FC<Props> = ({ clubs, cvInput, setCvInput }) => {
  return (
    <ul className={styles.clubs}>
      {clubs.map((club) => (
        <li
          className={classNames(styles.club, {
            [styles.active]: cvInput?.type === "club" && cvInput.id === club.id,
          })}
          key={club.id}
        >
          <span
            onClick={() => {
              setCvInput({ type: "club", id: club.id });
            }}
          >
            <Club club={club} showCity={false} showCountry={false} />
          </span>
        </li>
      ))}
    </ul>
  );
};

export { ClubsCell };
