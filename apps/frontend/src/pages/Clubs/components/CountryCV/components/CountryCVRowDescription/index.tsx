import { CountryCV, CountryCVStatus } from "@fbs2.0/types";
import { FC } from "react";

import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  row: CountryCV;
}

const CountryCVRowDescription: FC<Props> = ({
  row: { host, guest, status },
}) => {
  switch (status) {
    case CountryCVStatus.RunnerUp:
      return (
        <>
          <td>Фіналіст</td>
          <td>
            <Club
              showCountry={false}
              club={host.isWinner ? guest.club : host.club}
            />
          </td>
        </>
      );

    case CountryCVStatus.Both:
      return (
        <>
          <td>
            <ul className={styles["mono-final"]}>
              <li>Переможець</li>
              <li>Фіналіст</li>
            </ul>
          </td>
          <td>
            <ul className={styles["mono-final"]}>
              <li>
                <Club
                  showCountry={false}
                  club={host.isWinner ? host.club : guest.club}
                />
              </li>
              <li>
                <Club
                  showCountry={false}
                  club={host.isWinner ? guest.club : host.club}
                />
              </li>
            </ul>
          </td>
        </>
      );

    case CountryCVStatus.Winner:
      return (
        <>
          <td>Переможець</td>
          <td>
            <Club
              showCountry={false}
              club={host.isWinner ? host.club : guest.club}
            />
          </td>
        </>
      );

    default:
      return (
        <>
          <td></td>
          <td></td>
        </>
      );
  }
};

export default CountryCVRowDescription;
