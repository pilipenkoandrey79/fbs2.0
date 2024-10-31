import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StageSubstitution as StageSubstitutionInterface } from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

import { Stage } from "../../match/entities/stage.entity";
import { Participant } from "../../participant/entities/participant.entity";

@Entity()
export class StageSubstitution implements StageSubstitutionInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @ManyToOne(() => Stage, { onDelete: "CASCADE" })
  @ApiProperty({ type: () => Stage })
  stage: Stage;

  @ManyToOne(() => Participant, { onDelete: "CASCADE" })
  @ApiProperty({ type: () => Participant })
  expelled: Participant;

  @ManyToOne(() => Participant, { onDelete: "CASCADE" })
  @ApiProperty({ type: () => Participant })
  sub: Participant;
}
