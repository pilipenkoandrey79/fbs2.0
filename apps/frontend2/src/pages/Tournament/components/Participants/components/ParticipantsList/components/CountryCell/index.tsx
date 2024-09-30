import { FC } from "react";
import { Club } from "@fbs2.0/types";

import { Flag } from "../../../../../../../../components/Flag";

import styles from "./styles.module.scss";

interface Props {
  club: Club;
}

const CountryCell: FC<Props> = ({ club }) => (
  <span className={styles.country}>
    <span className={styles.name}>{club.city.country.name}</span>
    <span className={styles.code}>
      <Flag country={club.city.country} />
    </span>
  </span>
);

export { CountryCell };