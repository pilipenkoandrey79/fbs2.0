import { Radio, RadioChangeEvent } from "antd";
import { FC, useContext } from "react";
import { SortBy } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { SortByContext } from "../../../../context/sortByContext";

const Sorter: FC = () => {
  const { sortBy, setSortBy } = useContext(SortByContext);
  const { t } = useTranslation();

  return (
    <Radio.Group
      options={Object.values(SortBy).map((value) => ({
        value,
        label: t(`coefficient.sort.${value}`),
      }))}
      onChange={({ target: { value } }: RadioChangeEvent) => setSortBy(value)}
      value={sortBy}
      optionType="button"
      buttonStyle="solid"
      style={{ whiteSpace: "nowrap" }}
    />
  );
};

export { Sorter };
