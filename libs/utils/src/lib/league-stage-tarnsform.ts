import {
  _LeagueStageData,
  BaseMatch,
  TournamentPart,
  DEFAULT_SWISS_LENGTH,
  _StageTableData,
} from "@fbs2.0/types";
import { _getStageLabel } from "./common";

import { prepareGroupTeamsStanding } from "./prepare-group-standing";
import { _transformKnockoutStage } from "./knockout-stage-transform";

const getLeagueResultsTemplate = () =>
  new Array(DEFAULT_SWISS_LENGTH / 4 - 1).fill(1).reduce(
    (acc, _, index) => ({
      ...acc,
      [index + 1]: { headers: ["", ""], rows: [] } as _StageTableData,
    }),
    {}
  );

const prepareMatchesData = ({ matches, stage }: TournamentPart) =>
  ({
    table: prepareGroupTeamsStanding(matches, stage),
    tours:
      matches.length > 0
        ? matches
            .reduce<{ tour: number; matches: BaseMatch[] }[]>((acc, match) => {
              const tourIdx = acc.findIndex(({ tour }) => tour === match.tour);

              if (tourIdx >= 0) {
                acc[tourIdx].matches.push(match);
              } else if (typeof match.tour === "number") {
                acc.push({ tour: match.tour, matches: [match] });
              }

              return acc;
            }, [])
            .reduce<_LeagueStageData["tours"]>(
              (acc, { tour, matches }) => ({
                ...acc,
                [tour]: _transformKnockoutStage({ stage, matches }).matches,
              }),
              getLeagueResultsTemplate()
            )
        : getLeagueResultsTemplate(),
  } as _LeagueStageData);

export const transformLeagueStage = (tournamentPart: TournamentPart) => ({
  stage: {
    ...tournamentPart.stage,
    label: _getStageLabel(tournamentPart.stage.stageType),
  },
  matches: prepareMatchesData(tournamentPart),
});
