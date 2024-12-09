import { Flex } from "antd";
import { FC } from "react";

import { CountrySelector, CountrySelectorProps } from "../CountrySelector";

const InitialView: FC<CountrySelectorProps> = (props) => (
  <Flex style={{ minHeight: 400 }} justify="center" align="center">
    <CountrySelector {...props} />
  </Flex>
);

export { InitialView };
