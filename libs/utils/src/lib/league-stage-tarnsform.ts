import {
  LeagueStageData,
  BaseMatch,
  TournamentPart,
  DEFAULT_SWISS_LENGTH,
  StageTableData,
} from "@fbs2.0/types";
import { getStageLabel } from "./common";

import { prepareGroupTeamsStanding } from "./prepare-group-standing";
import { transformKnockoutStage } from "./knockout-stage-transform";

const getLeagueResultsTemplate = () =>
  new Array(DEFAULT_SWISS_LENGTH / 4 - 1).fill(1).reduce(
    (acc, _, index) => ({
      ...acc,
      [index + 1]: { headers: ["", ""], rows: [] } as StageTableData,
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
            .reduce<LeagueStageData["tours"]>(
              (acc, { tour, matches }) => ({
                ...acc,
                [tour]: transformKnockoutStage({ stage, matches }).matches,
              }),
              getLeagueResultsTemplate()
            )
        : getLeagueResultsTemplate(),
  } as LeagueStageData);

export const transformLeagueStage = (tournamentPart: TournamentPart) => ({
  stage: {
    ...tournamentPart.stage,
    label: getStageLabel(tournamentPart.stage.stageType),
  },
  matches: prepareMatchesData(tournamentPart),
});
