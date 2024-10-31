import { Stage, TournamentSeason } from "@fbs2.0/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { getTournamentStages } from "./useGetTournamentStages";

export const useCopyFromPrevious = () =>
  useMutation<Stage[], AxiosError, Omit<TournamentSeason, "id">>({
    mutationFn: async ({ season, tournament }: Omit<TournamentSeason, "id">) =>
      await getTournamentStages(season, tournament),
  });
