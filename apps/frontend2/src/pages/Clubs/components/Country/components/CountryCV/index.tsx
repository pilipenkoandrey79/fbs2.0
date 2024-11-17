import { FC } from "react";

import styles from "./styles.module.scss";

interface Props {
  id: number | undefined;
}

const CountryCV: FC<Props> = ({ id }) => {
  return <div className={styles.cv}></div>;
};

export { CountryCV };
