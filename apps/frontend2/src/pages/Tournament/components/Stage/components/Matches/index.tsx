import { Group, Participant, TournamentPart } from "@fbs2.0/types";
import { message } from "antd";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";

import { KnockoutStage } from "./components/KnockoutStage";

import styles from "./styles.module.scss";

interface Props {
  visible: boolean;
  participants: Participant[];
  tournamentPart: TournamentPart;
  highlightedClubId: number | null;
}

const Matches: FC<Props> = ({
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
      <h3>{`${t("tournament.stages.matches.title")}`}</h3>

      {Object.entries(tournamentPart.matches?.[Group.A]?.tours).map(
        (tour, _, tours) => (
          <Fragment key={tour[0]}>
            {tours.length > 1 && (
              <h4>{`${t("tournament.stages.matches.subtitle", {
                tour: tour[0],
              })}`}</h4>
            )}
            <KnockoutStage
              participants={participants}
              matches={tour[1]}
              stage={tournamentPart.stage}
              highlightedClubId={highlightedClubId}
              messageApi={messageApi}
            />
          </Fragment>
        )
      )}
    </div>
  );
};

export { Matches };
