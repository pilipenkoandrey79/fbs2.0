import { FC } from "react";
import {
  Group as GroupName,
  GroupRow,
  Tournament,
  TournamentDataRow,
} from "@fbs2.0/types";
import { isGroupFinished, isNotEmpty } from "@fbs2.0/utils";

import { Group } from "./component/Group";
import { StageProps } from "../../types";

import styles from "./styles.module.scss";

const getColorClasses = (tournament: Tournament) => {
  const index = Object.values(Tournament).indexOf(tournament);

  return [
    {
      club: styles[`first-color-group-${index + 1}-club`],
      divider: styles[`first-color-group-${index + 1}-divider`],
    },
    {
      club: styles[`second-color-group-${index + 1}-club`],
      divider: styles[`second-color-group-${index + 1}-divider`],
    },
  ];
};

const GroupStage: FC<TournamentDataRow & StageProps> = ({
  stage,
  matches,
  version,
  participants,
  highlightedClubId,
}) => {
  const groupNames = Object.values(GroupName)
    .slice(0, stage.stageScheme.groups)
    .reduce<GroupName[][]>((acc, name) => {
      const lastAccElement = acc.length > 0 ? acc[acc.length - 1] : undefined;

      if (lastAccElement && lastAccElement.length < 2) {
        acc[acc.length - 1].push(name);

        return acc;
      }

      return [...acc, [name]];
    }, []);

  return (
    <div className={styles.stage}>
      {groupNames.map((namesPair, pairIndex) => (
        <div key={namesPair.join("")} className={styles["group-pair"]}>
          {namesPair.map((name, idx) => {
            const groupTableRows =
              (matches as Record<GroupName, GroupRow[]>)[name] || [];

            const colorClasses = getColorClasses(
              stage.tournamentSeason.tournament
            );

            return (
              <Group
                key={name}
                name={name}
                stage={stage}
                season={stage.tournamentSeason.season}
                tableRows={groupTableRows}
                className={styles["group-pair-group"]}
                version={version}
                colorClasses={
                  groupNames.length < 2
                    ? colorClasses[idx]
                    : pairIndex + 1 <= groupNames.length / 2
                    ? colorClasses[0]
                    : colorClasses[1]
                }
                stageParticipants={participants}
                highlightedClubId={highlightedClubId}
                tournament={stage.tournamentSeason.tournament}
                isFinished={isGroupFinished(
                  groupTableRows,
                  stage.stageScheme.type
                )}
                stageScheme={stage.stageScheme}
                hasLinkedTournanent={isNotEmpty(stage.linkedTournament)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GroupStage;
