import { Tournament } from "@fbs2.0/types";
import { getTournamentTitle } from "@fbs2.0/utils";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { getLogoSrc } from "./utils";

const TournamentLogo: FC = () => {
  const { t } = useTranslation();
  const { season, tournament } = useParams();

  const title = `${t(
    getTournamentTitle({
      season,
      tournament: tournament as Tournament,
    })
  )} ${season}`;

  return <img src={getLogoSrc(season, tournament)} alt={title} height={40} />;
};

export { TournamentLogo };
