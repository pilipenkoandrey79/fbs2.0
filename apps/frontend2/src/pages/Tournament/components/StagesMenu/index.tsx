import { FC, useMemo } from "react";
import { Menu, MenuProps } from "antd";
import { ItemType } from "antd/es/menu/interface";
import { useTranslation } from "react-i18next";
import { getStageTransKey } from "@fbs2.0/utils";
import { Tournament } from "@fbs2.0/types";
import { generatePath, useNavigate, useParams } from "react-router";

import { useGetTournamentStages } from "../../../../react-query-hooks/tournament/useGetTournamentStages";
import { Paths } from "../../../../routes";

interface Props {
  large: boolean;
  classname?: string;
  defaultSelectedKey?: string;
}

const StagesMenu: FC<Props> = ({ large, classname, defaultSelectedKey }) => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();
  const navigate = useNavigate();

  const stages = useGetTournamentStages(season, tournament as Tournament);

  const items = useMemo<MenuProps["items"]>(
    () =>
      stages.data?.map<ItemType>((stage) => ({
        key: stage.stageType,
        label: t(getStageTransKey(stage.stageType, !large)),
      })),
    [stages.data, t],
  );

  const onClick: MenuProps["onClick"] = ({ key }) => {
    navigate(
      generatePath(`${Paths.TOURNAMENT}/${Paths.STAGE}`, {
        stage: encodeURIComponent(key),
        season: `${season}`,
        tournament: `${tournament}`,
      }),
    );
  };

  return (
    <Menu
      mode={large ? "vertical" : "horizontal"}
      items={items}
      onClick={onClick}
      className={classname}
      defaultSelectedKeys={
        defaultSelectedKey ? [defaultSelectedKey] : undefined
      }
    />
  );
};

export { StagesMenu };
