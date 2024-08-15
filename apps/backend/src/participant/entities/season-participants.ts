import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  SeasonParticipantsClub as SeasonParticipantsClubInterface,
  SeasonParticipantsClubParticipation as SeasonParticipantsClubParticipationInterface,
  SeasonParticipants as SeasonParticipantsInterface,
  StageType,
  Tournament,
} from "@fbs2.0/types";

import { Country } from "../../country/entities/country.entity";
import { Club } from "../../club/entities/club.entity";
import { Stage } from "../../match/entities/stage.entity";

class SeasonParticipantsClubParticipation
  implements SeasonParticipantsClubParticipationInterface
{
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty({ enum: Tournament })
  tournament: Tournament;

  @ApiProperty({ enum: StageType })
  startingStage: StageType;

  @ApiProperty({ type: () => Stage })
  fromStage: Stage;
}

class SeasonParticipantsClub implements SeasonParticipantsClubInterface {
  @ApiProperty({ type: () => Club })
  club: Club;

  @ApiProperty({ type: () => [SeasonParticipantsClubParticipation] })
  participations: SeasonParticipantsClubParticipation[];

  @ApiPropertyOptional({ type: "number" })
  coefficient?: number;
}

export class SeasonParticipants implements SeasonParticipantsInterface {
  @ApiProperty({ type: () => Country })
  country: Country;

  @ApiProperty({ type: () => [SeasonParticipantsClub] })
  clubs: SeasonParticipantsClub[];

  @ApiPropertyOptional({ type: "number" })
  coefficient?: number;
}
