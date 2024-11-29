import { Club as ClubType, Winner } from "@fbs2.0/types";
import { FC } from "react";
import { getTournamentTitle } from "@fbs2.0/utils";
import { useTranslation } from "react-i18next";

import { Club } from "../../../../../../components/Club";

import styles from "./styles.module.scss";

interface Props {
  club: ClubType;
  winners: Winner[] | undefined;
}

const ClubCell: FC<Props> = ({ club, winners }) => {
  const { t } = useTranslation();

  const { tournament, season } = {
    ...winners?.find(({ winner }) => winner?.club.id === club.id)?.tournament,
  };

  return (
    <Club
      club={club}
      showCountry={false}
      className={tournament && season ? styles.winner : undefined}
      tooltip={
        tournament && season
          ? `${t("coefficient.winner")}${t(
              getTournamentTitle({ season, tournament })
            )} ${season}`
          : undefined
      }
    />
  );
};

export { ClubCell };
