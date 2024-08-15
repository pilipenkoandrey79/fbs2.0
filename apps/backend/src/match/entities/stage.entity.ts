import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Stage as StageInterface, StageType, Tournament } from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

import { TournamentSeason } from "../../shared/entities/tournament-season.entity";
import { StageScheme } from "./stage-scheme.entity";
import { StageSubstitution } from "../../tournament/entities/stage-substitution.entity";

@Entity()
export class Stage implements StageInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @ManyToOne(() => TournamentSeason, { nullable: true, onDelete: "CASCADE" })
  @ApiProperty({ type: () => TournamentSeason })
  tournamentSeason: TournamentSeason;

  @Column({ type: "enum", enum: StageType, nullable: false })
  @ApiProperty({ enum: StageType })
  stageType: StageType;

  @ManyToOne(() => StageScheme, { nullable: true })
  @ApiProperty({ type: () => StageScheme })
  stageScheme: StageScheme;

  @ManyToOne(() => Stage, { nullable: true })
  @ApiProperty({ type: () => Stage })
  previousStage: Stage;

  @Column({ type: "enum", enum: Tournament, nullable: true })
  @ApiProperty({ enum: Tournament })
  linkedTournament: Tournament;

  @Column({ type: "enum", enum: StageType, nullable: true })
  @ApiProperty({ enum: StageType })
  linkedTournamentStage: StageType;

  @OneToMany(
    () => StageSubstitution,
    (stageSubstitution) => stageSubstitution.stage
  )
  @ApiProperty({ type: () => [StageSubstitution] })
  stageSubstitutions?: StageSubstitution[];
}
