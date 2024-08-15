import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {
  Tournament,
  TournamentSeason as TournamentSeasonInterface,
} from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class TournamentSeason implements TournamentSeasonInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @Column({ type: "enum", enum: Tournament, nullable: false })
  @ApiProperty({ enum: Tournament })
  tournament: Tournament;

  @Column({ type: "varchar", length: 10, nullable: false })
  @ApiProperty({ type: "string" })
  season: string;
}
