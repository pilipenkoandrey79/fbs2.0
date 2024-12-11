import { Flex } from "antd";
import { FC } from "react";
import { CarryOutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getCVBalance } from "@fbs2.0/utils";
import { Club as ClubInterface, ClubCV, Combat, Country } from "@fbs2.0/types";

import { CombatComponentProps } from "../..";
import { Balance } from "../../../../../../../../../../components/Balance";
import { Club } from "../../../../../../../../../../components/Club";
import { Language } from "../../../../../../../../../../i18n/locales";

import styles from "./styles.module.scss";

const CombatStats: FC<CombatComponentProps> = ({ data, country, rival }) => {
  const { t, i18n } = useTranslation();

  const { balance, matches } = getCVBalance(
    data ? ([{ balance: data.balance }] as unknown as ClubCV[]) : [],
  );

  const clubs = data?.rows.reduce<{
    c: ClubInterface[];
    r: ClubInterface[];
  }>(
    (acc, { stages }) => {
      stages.forEach(({ matches }) =>
        matches.forEach(({ host, guest }) => {
          [host, guest].forEach((participant) => {
            if (participant.club.city.country.id === country.id) {
              if (!acc.c.find(({ id }) => id === participant.club.id)) {
                acc.c.push(participant.club);
              }
            } else {
              if (!acc.r.find(({ id }) => id === participant.club.id)) {
                acc.r.push(participant.club);
              }
            }
          });
        }),
      );

      return acc;
    },
    { c: [], r: [] },
  );

  return (
    <Flex justify="space-between">
      <Flex justify="space-between" className={styles.balance}>
        <div>
          <Flex gap={8} className={styles.matches}>
            <CarryOutOutlined />
            <span>{matches}</span>
          </Flex>
        </div>
        <Balance balance={balance} />
      </Flex>
      <Flex wrap gap="large">
        {[
          { country, clubs: clubs?.c },
          { country: rival, clubs: clubs?.r },
        ].map((data) => (
          <div key={data.country.id}>
            <p>
              {t("clubs.combats.presented", {
                number: data.clubs?.length,
                country:
                  (i18n.resolvedLanguage === Language.en
                    ? data.country.name
                    : data.country.name_ua) || data.country.name,
              })}
            </p>
            <ul>
              {data.clubs?.map((club) => (
                <li key={club.id}>
                  <Club club={club} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Flex>
    </Flex>
  );
};

export { CombatStats };
