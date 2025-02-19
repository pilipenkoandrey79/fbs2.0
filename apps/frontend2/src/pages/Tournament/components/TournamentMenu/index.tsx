import { Menu } from "antd";
import { FC, useContext } from "react";
import { AvailableTournaments } from "@fbs2.0/types";
import { generatePath, useParams } from "react-router";
import { Link } from "react-router";
import { getTournamentTitle } from "@fbs2.0/utils";
import { OrderedListOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useGetTournamentSeasons } from "../../../../react-query-hooks/tournament/useGetTournamentSeasons";
import { Paths } from "../../../../routes";
import { HighlightContext } from "../../../../context/highlightContext";

const TournamentMenu: FC = () => {
  const { t } = useTranslation();
  const { setHighlightId } = useContext(HighlightContext);
  const { season, tournament } = useParams();
  const { data: availableTournaments } = useGetTournamentSeasons();

  const getNavLinks = () => {
    const tournaments = (availableTournaments as AvailableTournaments)?.[
      season || ""
    ]
      ?.filter((availableTournament) => tournament !== availableTournament.type)
      ?.map(({ type }) => ({
        key: type,
        label: (
          <Link
            to={generatePath(Paths.TOURNAMENT, {
              tournament: type,
              season: season || "",
            })}
          >
            {t(
              getTournamentTitle({ season, tournament: type }, { short: true })
            )}
          </Link>
        ),
      }));

    return [
      {
        key: "coeff",
        label: (
          <Link to={generatePath(Paths.COEFFICIENT, { season: season || "" })}>
            <OrderedListOutlined />
          </Link>
        ),
      },
      ...(tournaments || []),
    ];
  };

  return (
    <Menu
      items={getNavLinks()}
      onClick={() => setHighlightId(null)}
      mode="horizontal"
      theme="dark"
    />
  );
};

export { TournamentMenu };
