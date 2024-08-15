import { GroupRow, Stage, BaseMatch } from '@fbs2.0/types';

import { TiebreakerRule, getTiebreakersRules } from './tiebreakers-rules';

type Rule = {
  label: TiebreakerRule;
  comparator: (a: GroupRow, b: GroupRow, matches: BaseMatch[]) => number;
};

const allRules: Rule[] = [
  { label: TiebreakerRule.Score, comparator: (a, b) => b.score - a.score },
  {
    label: TiebreakerRule.Head2HeadDiff,
    comparator: (a, b, matches) => {
      const abMatch = matches.find(
        ({ host, guest }) => host.id === a.team.id && guest.id === b.team.id
      );

      const baMatch = matches.find(
        ({ host, guest }) => host.id === b.team.id && guest.id === a.team.id
      );

      const aGF = (abMatch?.hostScore || 0) + (baMatch?.guestScore || 0);
      const aGA = (abMatch?.guestScore || 0) + (baMatch?.hostScore || 0);
      const bGF = (baMatch?.hostScore || 0) + (abMatch?.guestScore || 0);
      const bGA = (baMatch?.guestScore || 0) + (abMatch?.hostScore || 0);

      const aDiff = aGF - aGA;
      const bDiff = bGF - bGA;

      return bDiff - aDiff;
    },
  },
  {
    label: TiebreakerRule.Head2HeadScore,
    comparator: (a, b, matches) => {
      const abMatch = matches.find(
        ({ host, guest }) => host.id === a.team.id && guest.id === b.team.id
      );

      const baMatch = matches.find(
        ({ host, guest }) => host.id === b.team.id && guest.id === a.team.id
      );

      const aScore =
        (abMatch?.hostScore || 0) > (abMatch?.guestScore || 0)
          ? 3
          : ((abMatch?.hostScore || 0) === (abMatch?.guestScore || 0) ? 1 : 0) +
              (baMatch?.guestScore || 0) >
            (baMatch?.hostScore || 0)
          ? 3
          : (baMatch?.guestScore || 0) === (baMatch?.hostScore || 0)
          ? 1
          : 0;

      const bScore =
        (baMatch?.hostScore || 0) > (baMatch?.guestScore || 0)
          ? 3
          : ((baMatch?.hostScore || 0) === (baMatch?.guestScore || 0) ? 1 : 0) +
              (abMatch?.guestScore || 0) >
            (abMatch?.hostScore || 0)
          ? 3
          : (abMatch?.guestScore || 0) === (abMatch?.hostScore || 0)
          ? 1
          : 0;

      return bScore - aScore;
    },
  },
  {
    label: TiebreakerRule.Head2HeadAwayGoals,
    comparator: (a, b, matches) => {
      const abMatch = matches.find(
        ({ host, guest }) => host.id === a.team.id && guest.id === b.team.id
      );

      const baMatch = matches.find(
        ({ host, guest }) => host.id === b.team.id && guest.id === a.team.id
      );

      return (abMatch?.guestScore || 0) - (baMatch?.guestScore || 0);
    },
  },
  {
    label: TiebreakerRule.TotalDiff,
    comparator: (a, b) => {
      const aTotalDiff = a.goals[0] - a.goals[1];
      const bTotalDiff = b.goals[0] - b.goals[1];

      return bTotalDiff - aTotalDiff;
    },
  },
  {
    label: TiebreakerRule.GoalsFor,
    comparator: (a, b) => {
      return b.goals[0] - a.goals[0];
    },
  },
  {
    label: TiebreakerRule.Head2HeadGoalsFor,
    comparator: (a, b, matches) => {
      const abMatch = matches.find(
        ({ host, guest }) => host.id === a.team.id && guest.id === b.team.id
      );

      const baMatch = matches.find(
        ({ host, guest }) => host.id === b.team.id && guest.id === a.team.id
      );

      const aGF = (abMatch?.hostScore || 0) + (baMatch?.guestScore || 0);
      const bGF = (baMatch?.hostScore || 0) + (abMatch?.guestScore || 0);

      return bGF - aGF;
    },
  },
  {
    label: TiebreakerRule.GoalsAway,
    comparator: (a, b, matches) => {
      const aGoalsAway = matches.reduce<number>(
        (acc, { guest, guestScore }) =>
          guest.id === a.team.id ? acc + (guestScore ?? 0) : acc,
        0
      );

      const bGoalsAway = matches.reduce<number>(
        (acc, { guest, guestScore }) =>
          guest.id === b.team.id ? acc + (guestScore ?? 0) : acc,
        0
      );

      return bGoalsAway - aGoalsAway;
    },
  },
  {
    label: TiebreakerRule.Wins,
    comparator: (a, b) => b.win - a.win,
  },
  {
    label: TiebreakerRule.WinsAway,
    comparator: (a, b, matches) => {
      const aWinsAway = matches.reduce<number>(
        (acc, { guest, guestScore, hostScore }) =>
          guest.id === a.team.id && (guestScore ?? 0) > (hostScore ?? 0)
            ? acc + 1
            : acc,
        0
      );

      const bWinsAway = matches.reduce<number>(
        (acc, { guest, guestScore, hostScore }) =>
          guest.id === b.team.id && (guestScore ?? 0) > (hostScore ?? 0)
            ? acc + 1
            : acc,
        0
      );

      return bWinsAway - aWinsAway;
    },
  },
];

export const groupSort = (
  a: GroupRow,
  b: GroupRow,
  matches: BaseMatch[],
  stage: Stage,
  fullGroup?: boolean
) => {
  const rules = getTiebreakersRules(stage).reduce<Rule[]>((acc, sortRule) => {
    const rule = allRules.find(({ label }) => label === sortRule);

    if (rule) {
      if (
        fullGroup &&
        [
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.Head2HeadAwayGoals,
        ].includes(sortRule)
      ) {
        return acc;
      }

      acc.push(rule);
    }

    return acc;
  }, []);

  for (const rule of rules) {
    const result = rule.comparator(a, b, matches) || 0;

    if (result !== 0) {
      return result;
    }
  }

  return 0;
};
