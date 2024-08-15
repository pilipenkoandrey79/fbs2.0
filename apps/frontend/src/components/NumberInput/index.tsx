import { Label, NumericInput } from "@blueprintjs/core";
import classNames from "classnames";
import { FC } from "react";
import { isNotEmpty } from "@fbs2.0/utils";

import styles from "./styles.module.scss";

interface Props {
  className?: string;
  value: number | undefined;
  max?: number;
  min?: number;
  disabled?: boolean;
  label?: string | React.ReactNode;
  setValue: (value: number) => void;
}

const NumberInput: FC<Props> = ({
  value,
  max,
  min,
  disabled,
  setValue,
  className,
  label,
}) => (
  <div className={classNames(className, styles["number-input"])}>
    <Label>
      {label}
      <div>
        <NumericInput
          value={value}
          onValueChange={setValue}
          disabled={disabled}
          large
          fill
          min={min || 0}
          {...(isNotEmpty(max) ? { max } : {})}
        />
      </div>
    </Label>
  </div>
);

export { NumberInput };
