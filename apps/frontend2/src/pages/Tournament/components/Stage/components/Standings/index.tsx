import { Group, TournamentPart } from "@fbs2.0/types";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";

import { GroupTable } from "./components/GroupTable";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
  loading: boolean;
}

const Standings: FC<Props> = ({
  visible,
  tournamentPart,
  highlightedClubId,
  loading,
}) => {
  const { t } = useTranslation();

  const getGroupIndexes = () => {
    const groupIndexes = Object.values(Group).slice(
      0,
      tournamentPart.stage.stageScheme.groups || 1
    );

    const midIndex = Math.floor(groupIndexes.length / 2);

    return midIndex > 0
      ? [
          { indexes: groupIndexes.slice(0, midIndex), key: "1" },
          { indexes: groupIndexes.slice(midIndex), key: "2" },
        ]
      : [{ indexes: groupIndexes, key: "1" }];
  };

  return (
    <div style={{ display: visible ? "block" : "none" }}>
      <div className={styles.standings}>
        {getGroupIndexes().map(({ key, indexes }) => (
          <div key={key} className={styles.panel}>
            {indexes.map((group) => (
              <Fragment key={group}>
                {(tournamentPart.stage.stageScheme.groups || 1) > 1 && (
                  <h4>{`${t("tournament.stages.matches.group_subtitle", {
                    group,
                  })}`}</h4>
                )}
                <GroupTable
                  tournamentPart={tournamentPart}
                  highlightedClubId={highlightedClubId}
                  group={group}
                  groupKey={key}
                  loading={loading}
                />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Standings };
