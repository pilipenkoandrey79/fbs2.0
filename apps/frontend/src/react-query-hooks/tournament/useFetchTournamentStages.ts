import { useMutation } from "@tanstack/react-query";
import { ApiEntities, Stage, StageDto, Tournament } from "@fbs2.0/types";
import { AxiosError } from "axios";
import { isNotEmpty, transformStageToDto } from "@fbs2.0/utils";

import { onError } from "../callbacks";
import ApiClient from "../../api/api.client";

export const fetchTournamentStages = async (
  season: string | undefined,
  tournament: Tournament | undefined
) =>
  await ApiClient.getInstance().get<Stage[]>(
    `${ApiEntities.Tournament}/${season}/${tournament}`
  );

export const useFetchTournamentStages = (
  onSuccess: (data: StageDto[]) => void
) =>
  useMutation<
    StageDto[],
    AxiosError,
    {
      tournament: Tournament | undefined;
      season: string | undefined;
    }
  >({
    mutationFn: async ({ season, tournament }) =>
      !isNotEmpty(season) || !isNotEmpty(tournament)
        ? []
        : (await fetchTournamentStages(season, tournament)).map(
            transformStageToDto
          ),
    onSuccess,
    onError,
  });
