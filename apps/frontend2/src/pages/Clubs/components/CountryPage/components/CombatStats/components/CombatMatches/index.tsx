import { FC } from "react";
import { Flex, Skeleton } from "antd";
import { Country } from "@fbs2.0/types";

import { CountrySelector, CountrySelectorProps } from "../CountrySelector";
import { useGetCombatMatches } from "../../../../../../../../react-query-hooks/match/useGetCombatMatches";

import styles from "./styles.module.scss";

interface Props extends CountrySelectorProps {
  country: Country;
  rival: Country;
}

const CombatMatches: FC<Props> = ({ rival, country, setRival }) => {
  const combatMatches = useGetCombatMatches(country.id, rival.id);

  console.log(combatMatches.data);

  return (
    <Flex vertical>
      <CountrySelector rival={rival} setRival={setRival} />
      {combatMatches.isLoading ? (
        <div className={styles.matches}>
          <Skeleton.Node active />
        </div>
      ) : (
        <div></div>
      )}
    </Flex>
  );
};

export { CombatMatches };
