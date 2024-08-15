import { Club as ClubInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

import { Flag } from "../Flag";

import styles from "./styles.module.scss";

interface Props {
  club: Partial<ClubInterface>;
  showCountry?: boolean;
  expelled?: boolean;
  className?: string;
}

const Club: FC<Props> = ({ club, showCountry = true, expelled, className }) => {
  const city = (club?.name === club?.city?.name ? "" : club?.city?.name) || "";

  return (
    <span
      className={classNames(
        styles.club,
        Classes.TEXT_OVERFLOW_ELLIPSIS,
        {
          [styles.expelled]: expelled,
        },
        className
      )}
    >
      {showCountry && (
        <Flag country={club?.city?.country} className={styles.flag} />
      )}
      {club?.name}
      {city && (
        <span className={classNames(Classes.TEXT_SMALL, styles.city)}>
          {`(${city})`}
        </span>
      )}
    </span>
  );
};

export { Club };
