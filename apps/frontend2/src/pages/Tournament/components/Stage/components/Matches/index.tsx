import {
  Group,
  GROUP_STAGES,
  Participant,
  StageInternal,
  StageSchemeType,
  TournamentPart,
} from "@fbs2.0/types";
import { Divider } from "antd";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { KnockoutStageTable } from "./components/KnockoutStageTable";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  participants: {
    seeded: Participant[] | undefined;
    previousStageWinners: Participant[] | undefined;
    skippers: Participant[] | undefined;
  };
  tournamentPart: TournamentPart;
}

const Matches: FC<Props> = ({ visible, tournamentPart, participants }) => {
  const { t } = useTranslation();

  const groupIndexes = Object.values(Group).slice(
    0,
    tournamentPart.stage.stageScheme.groups || 1
  );

  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className={classNames(
        styles.matches,
        styles[tournamentPart.stage.tournamentSeason.tournament]
      )}
    >
      <h3>{`${t("tournament.stages.matches.title")}`}</h3>
      <div className={styles.groups}>
        {groupIndexes.map((group, _, groups) => (
          <div key={group} className={styles.group}>
            {groups.length > 1 && (
              <h4>{`${t("tournament.stages.matches.group_subtitle", {
                group,
              })}`}</h4>
            )}
            {Object.keys(
              tournamentPart.matches?.[group as Group]?.tours ?? { "1": [] }
            ).map((tour, index, tours) => (
              <Fragment key={tour}>
                {tours.length > 1 && (
                  <h4 className={styles["tour-title"]}>{`${t(
                    "tournament.stages.matches.subtitle",
                    {
                      tour,
                    }
                  )}`}</h4>
                )}
                <KnockoutStageTable
                  participants={participants}
                  matches={tournamentPart.matches}
                  stage={tournamentPart.stage as StageInternal}
                  tour={
                    [...GROUP_STAGES, StageSchemeType.LEAGUE].includes(
                      tournamentPart.stage.stageScheme.type
                    )
                      ? Number(tour)
                      : undefined
                  }
                  group={group as Group}
                />
                {tours.length > 1 && index < tours.length - 1 && (
                  <Divider type="horizontal" className={styles.divider} />
                )}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Matches };
