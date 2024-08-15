import { DeductedPoints as DeductedPointsInterface } from "@fbs2.0/types";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { Participant } from "../../participant/entities/participant.entity";
import { Match } from "./match.entity";

@Entity()
export class DeductedPoints implements DeductedPointsInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @ManyToOne(() => Match, (match) => match.deductedPointsList)
  @ApiProperty({ type: () => Match })
  match: Match;

  @ManyToOne(() => Participant, { nullable: false, onDelete: "CASCADE" })
  @ApiProperty({ type: () => Participant })
  participant: Participant;

  @Column({ type: "integer", nullable: false })
  @ApiProperty({ type: "number" })
  points: number;
}
