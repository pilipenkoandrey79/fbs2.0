import { ApiProperty } from "@nestjs/swagger";
import {
  ClubTournamentCoefficient as ClubTournamentCoefficientInterface,
  CoefficientData as CoefficientDataInterface,
  CountryClubCoefficient as CountryClubCoefficientInterface,
  SeasonCoefficient as SeasonCoefficientInterface,
  Tournament,
} from "@fbs2.0/types";

import { Country } from "../../country/entities/country.entity";
import { Club } from "../../club/entities/club.entity";

class SeasonCoefficient implements SeasonCoefficientInterface {
  @ApiProperty({ type: "number" })
  season: string;

  @ApiProperty({ type: "number" })
  coefficient: number;
}

class ClubTournamentCoefficient implements ClubTournamentCoefficientInterface {
  @ApiProperty({ enum: Tournament })
  tournament: Tournament;

  @ApiProperty({ type: "number" })
  coefficient: number;
}

class CountryClubCoefficient implements CountryClubCoefficientInterface {
  @ApiProperty({ type: () => Club })
  club: Club;

  @ApiProperty({ type: "number" })
  coefficient: number;

  @ApiProperty({ type: () => [ClubTournamentCoefficient] })
  participations: ClubTournamentCoefficient[];
}

export class CoefficientData implements CoefficientDataInterface {
  @ApiProperty({ type: () => [SeasonCoefficient] })
  seasonCoefficients: SeasonCoefficient[];

  @ApiProperty({ type: "number" })
  totalCoefficient: number;

  @ApiProperty({ type: () => Country })
  country: Country;

  @ApiProperty({ type: "number" })
  coefficient: number;

  @ApiProperty({ type: () => [CountryClubCoefficient] })
  clubs: CountryClubCoefficient[];
}
