import { FC } from "react";

import styles from "./styles.module.scss";

export type CVInput = { type: "club" | "country"; id: number | undefined };

interface Props {
  input: CVInput | null;
}

const CV: FC<Props> = ({ input }) => {
  return (
    <div className={styles.cv}>
      {input?.type}: {input?.id}
    </div>
  );
};

export { CV };
