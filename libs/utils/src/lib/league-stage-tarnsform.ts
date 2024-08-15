import { LeagueStageData, BaseMatch, TournamentPart } from '@fbs2.0/types';
import { getStageLabel } from '@fbs2.0/utils';

import { prepareGroupTeamsStanding } from './prepare-group-standing';
import { transformKnockoutStage } from './knockout-stage-transform';

const prepareMatchesData = ({ matches, stage }: TournamentPart) =>
  ({
    table: prepareGroupTeamsStanding(matches, stage),
    tours: matches
      .reduce<{ tour: number; matches: BaseMatch[] }[]>((acc, match) => {
        const tourIdx = acc.findIndex(({ tour }) => tour === match.tour);

        if (tourIdx >= 0) {
          acc[tourIdx].matches.push(match);
        } else if (typeof match.tour === 'number') {
          acc.push({ tour: match.tour, matches: [match] });
        }

        return acc;
      }, [])
      .reduce<LeagueStageData['tours']>((acc, { tour, matches }) => {
        return {
          ...acc,
          [tour]: transformKnockoutStage({ stage, matches }).matches,
        };
      }, {}),
  } as LeagueStageData);

export const transformLeagueStage = (tournamentPart: TournamentPart) => ({
  stage: {
    ...tournamentPart.stage,
    label: getStageLabel(tournamentPart.stage.stageType),
  },
  matches: prepareMatchesData(tournamentPart),
});
