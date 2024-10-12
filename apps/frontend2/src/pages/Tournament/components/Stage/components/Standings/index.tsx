import { FC } from "react";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
}

const Standings: FC<Props> = ({ visible }) => {
  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.standings}
    >
      Standings
    </div>
  );
};

export { Standings };
