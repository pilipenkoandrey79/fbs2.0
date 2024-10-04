import { Club as ClubInterface } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Typography } from "antd";

import { Flag } from "../Flag";

import styles from "./styles.module.scss";

interface Props {
  club: Partial<ClubInterface>;
  showCountry?: boolean;
  showCity?: boolean;
  expelled?: boolean;
  dimmed?: boolean;
  className?: string;
}

const Club: FC<Props> = ({
  club,
  showCountry = true,
  showCity = true,
  expelled,
  dimmed,
  className,
}) => {
  const city =
    showCity && (club?.name === club?.city?.name ? "" : club?.city?.name);

  return (
    <Typography.Text
      className={classNames(styles.club, className)}
      ellipsis={{ tooltip: club.name }}
      delete={expelled}
      type={dimmed ? "secondary" : undefined}
    >
      {showCountry && (
        <Flag country={club?.city?.country} className={styles.flag} />
      )}
      {club?.name}
      {city && <small className={styles.city}>{`(${city})`}</small>}
    </Typography.Text>
  );
};

export { Club };
