import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Participant as ParticipantInterface, StageType } from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

import { Club } from "../../club/entities/club.entity";
import { TournamentSeason } from "../../shared/entities/tournament-season.entity";
import { Stage } from "../../match/entities/stage.entity";

@Entity()
export class Participant implements ParticipantInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @ManyToOne(() => Club, { nullable: true, onDelete: "CASCADE" })
  @ApiProperty({ type: () => Club })
  club: Club;

  @ManyToOne(() => TournamentSeason, { nullable: false, onDelete: "CASCADE" })
  @ApiProperty({ type: () => TournamentSeason })
  tournamentSeason: TournamentSeason;

  @Column({ type: "enum", enum: StageType, nullable: false })
  @ApiProperty({ enum: StageType })
  startingStage: StageType;

  @ManyToOne(() => Stage, { nullable: true })
  @ApiProperty({ type: () => Stage })
  fromStage: Stage;
}
