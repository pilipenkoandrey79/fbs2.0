import { FC } from "react";
import { Icon } from "@blueprintjs/core";
import classNames from "classnames";

import styles from "./styles.module.scss";

interface Props {
  onAdd: () => void;
  disabled?: boolean;
}

const EmptyStage: FC<Props> = ({ onAdd, disabled }) => (
  <div
    className={classNames(styles["empty-stage"], {
      [styles.disabled]: disabled,
    })}
    onClick={onAdd}
  >
    <Icon icon="plus" color="#C5CBD3" />
  </div>
);

export { EmptyStage };
