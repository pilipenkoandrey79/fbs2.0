import { FC, useContext } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

import { CoefficientTable } from "./components/CoefficientTable";
import { Page } from "../../components/Page";
import { Header } from "./components/Header";
import { useCalculateCoefficient } from "../../react-query-hooks/coefficient/useCalculateCoefficient";
import { SortByContext } from "../../context/sortByContext";
import { useSortByContext } from "../../context/useSortByContext";
import { UserContext } from "../../context/userContext";

const Coefficient: FC = () => {
  const { t } = useTranslation();
  const { season } = useParams();
  const sortByState = useSortByContext();
  const { user } = useContext(UserContext);
  const calculate = useCalculateCoefficient();
  const title = t("coefficient.title", { season });

  return (
    <SortByContext.Provider value={sortByState}>
      <Page title={title}>
        <Header title={title} season={season} />
        {user?.isEditor && (
          <div>
            <Button
              onClick={async () => await calculate.mutateAsync(season)}
              icon={<PlayCircleOutlined />}
              type="primary"
              size="large"
              disabled={calculate.isPending}
            >
              {t("coefficient.calculate")}
            </Button>
          </div>
        )}
        <CoefficientTable />
      </Page>
    </SortByContext.Provider>
  );
};

export { Coefficient };
