import { Stage, Tournament } from "@fbs2.0/types";

export enum TiebreakerRule {
  Score = "score",
  Head2HeadScore = "head-to-head-score",
  Head2HeadDiff = "head-to-head-difference",
  Head2HeadAwayGoals = "head-to-head-away-goals",
  TotalDiff = "total-difference",
  GoalsFor = "goals-for",
  Head2HeadGoalsFor = "head-to-head-goals-for",
  GoalsAway = "goals-away",
  Wins = "wins",
  WinsAway = "wins-away",
}

export const getTiebreakersRules = (stage: Stage) => {
  const startYear = Number(stage.tournamentSeason.season.split("-")[0]);

  switch (stage.tournamentSeason.tournament) {
    case Tournament.CHAMPIONS_LEAGUE: {
      if (startYear <= 2010) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadAwayGoals,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
        ];
      }

      if (startYear <= 2014) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.Head2HeadAwayGoals,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
        ];
      }

      if (startYear <= 2020) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.Head2HeadAwayGoals,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      if (startYear <= 2023) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      // This is actually for League Phase
      return [
        TiebreakerRule.Score,
        TiebreakerRule.TotalDiff,
        TiebreakerRule.GoalsFor,
        TiebreakerRule.GoalsAway,
        TiebreakerRule.Wins,
        TiebreakerRule.WinsAway,
        //Higher number of points obtained collectively by league phase opponents
        //Superior collective goal difference of league phase opponents
        //Higher number of goals scored collectively by league phase opponents
      ];
    }
    case Tournament.EUROPE_LEAGUE: {
      if (startYear <= 2008) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      if (startYear <= 2010) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
        ];
      }

      if (startYear <= 2020) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.Head2HeadAwayGoals,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      if (startYear <= 2023) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      // This is actually for League Phase
      return [
        TiebreakerRule.Score,
        TiebreakerRule.TotalDiff,
        TiebreakerRule.GoalsFor,
        TiebreakerRule.GoalsAway,
        TiebreakerRule.Wins,
        TiebreakerRule.WinsAway,
        //Higher number of points obtained collectively by league phase opponents
        //Superior collective goal difference of league phase opponents
        //Higher number of goals scored collectively by league phase opponents
      ];
    }
    case Tournament.EUROPE_CONFERENCE_LEAGUE: {
      if (startYear <= 2023) {
        return [
          TiebreakerRule.Score,
          TiebreakerRule.Head2HeadScore,
          TiebreakerRule.Head2HeadDiff,
          TiebreakerRule.Head2HeadGoalsFor,
          TiebreakerRule.TotalDiff,
          TiebreakerRule.GoalsFor,
          TiebreakerRule.GoalsAway,
          TiebreakerRule.Wins,
          TiebreakerRule.WinsAway,
        ];
      }

      // This is actually for League Phase
      return [
        TiebreakerRule.Score,
        TiebreakerRule.TotalDiff,
        TiebreakerRule.GoalsFor,
        TiebreakerRule.GoalsAway,
        TiebreakerRule.Wins,
        TiebreakerRule.WinsAway,
        //Higher number of points obtained collectively by league phase opponents
        //Superior collective goal difference of league phase opponents
        //Higher number of goals scored collectively by league phase opponents
      ];
    }
    default:
      return [
        TiebreakerRule.Score,
        TiebreakerRule.TotalDiff,
        TiebreakerRule.GoalsFor,
      ];
  }
};
