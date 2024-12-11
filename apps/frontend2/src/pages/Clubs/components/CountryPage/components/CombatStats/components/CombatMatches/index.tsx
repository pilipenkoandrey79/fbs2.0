import { FC } from "react";
import { Divider, Flex, Skeleton } from "antd";
import { Combat, Country } from "@fbs2.0/types";

import { CombatStats } from "./components/CombatStats";
import { CombatTable } from "./components/CombatTable";
import { CountrySelector, CountrySelectorProps } from "../CountrySelector";
import { useGetCombatMatches } from "../../../../../../../../react-query-hooks/match/useGetCombatMatches";

import styles from "./styles.module.scss";

interface Props extends CountrySelectorProps {
  country: Country;
  rival: Country;
}

export interface CombatComponentProps {
  country: Country;
  rival: Country;
  data: Combat | undefined;
}

const CombatMatches: FC<Props> = ({ rival, country, setRival }) => {
  const combatMatches = useGetCombatMatches(country.id, rival.id);

  return (
    <Flex vertical>
      <div className={styles.selector}>
        <CountrySelector rival={rival} setRival={setRival} />
      </div>
      {combatMatches.isLoading ? (
        <Skeleton.Node active className={styles.skeleton} />
      ) : (
        <div>
          <CombatStats
            country={country}
            rival={rival}
            data={combatMatches.data}
          />
          <Divider />
          <CombatTable
            country={country}
            rival={rival}
            data={combatMatches.data}
          />
        </div>
      )}
    </Flex>
  );
};

export { CombatMatches };
