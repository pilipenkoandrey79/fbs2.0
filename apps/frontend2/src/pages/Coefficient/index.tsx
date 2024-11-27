import { FC } from "react";
import { useParams } from "react-router";

import { Page } from "../../components/Page";
import { useGetCoefficientData } from "../../react-query-hooks/coefficient/useGetCoefficientData";

const Coefficient: FC = () => {
  const { season } = useParams();
  const title = "Coefficient";
  const coefficients = useGetCoefficientData(season);

  console.log(coefficients.data);

  return <Page title={title}>Coefficient</Page>;
};

export { Coefficient };
