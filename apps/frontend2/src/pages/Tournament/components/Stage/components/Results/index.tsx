import {
  Group,
  GROUP_STAGES,
  Participant,
  TournamentPart,
} from "@fbs2.0/types";
import { message } from "antd";
import { FC } from "react";
import { isLeagueStage } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { KnockoutStage } from "./components/KnockoutStage";
import { GroupStage } from "./components/GroupStage";
import { LeagueStage } from "./components/LeagueStage";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  participants: Participant[];
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
}

const Results: FC<Props> = ({
  visible,
  tournamentPart,
  highlightedClubId,
  participants,
}) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={styles.matches}
    >
      {contextHolder}
      <h3>{`${t("tournament.stages.results.title")}`}</h3>
      {GROUP_STAGES.includes(tournamentPart.stage.stageScheme.type) ? (
        <GroupStage />
      ) : isLeagueStage(tournamentPart.stage) ? (
        <LeagueStage />
      ) : (
        <KnockoutStage
          participants={participants}
          matches={tournamentPart.matches[Group.A].tours["1"]}
          stage={tournamentPart.stage}
          highlightedClubId={highlightedClubId}
          messageApi={messageApi}
        />
      )}
    </div>
  );
};

export { Results };
