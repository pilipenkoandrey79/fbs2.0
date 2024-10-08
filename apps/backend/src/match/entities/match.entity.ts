import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Group,
  Match as MatchInterface,
  BaseMatch as BaseMatchInterface,
} from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

import { Stage } from "./stage.entity";
import { Participant } from "../../participant/entities/participant.entity";
import { DeductedPoints } from "./deducted-points.entity";

export class BaseMatch implements BaseMatchInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @Column({ type: "date", nullable: true })
  @ApiProperty({ type: "string" })
  date: string;

  @Column({ type: "date", nullable: true })
  @ApiProperty({ type: "string" })
  replayDate: string;

  @Column({ type: "boolean", default: false })
  @ApiProperty({ type: "boolean" })
  answer: boolean;

  @Column({ type: "enum", enum: Group, nullable: true })
  @ApiProperty({ enum: Group })
  group: Group;

  @Column({ type: "integer", nullable: true })
  @ApiProperty({ type: "number" })
  tour: number;

  @ManyToOne(() => Participant, { nullable: true, onDelete: "CASCADE" })
  @ApiProperty({ type: () => Participant })
  host: Participant;

  @ManyToOne(() => Participant, { nullable: true, onDelete: "CASCADE" })
  @ApiProperty({ type: () => Participant })
  guest: Participant;

  @Column({ type: "integer", nullable: true })
  @ApiProperty({ type: "number" })
  hostScore: number;

  @Column({ type: "integer", nullable: true })
  @ApiProperty({ type: "number" })
  guestScore: number;

  @Column({ type: "integer", nullable: true })
  @ApiProperty({ type: "number" })
  hostPen: number;

  @Column({ type: "integer", nullable: true })
  @ApiProperty({ type: "number" })
  guestPen: number;

  @ManyToOne(() => Participant, { nullable: true })
  @ApiProperty({ type: () => Participant })
  forceWinner: Participant;

  @Column({ type: "boolean", default: false })
  @ApiProperty({ type: "boolean" })
  unplayed: boolean;

  @Column({ type: "boolean", default: false })
  @ApiProperty({ type: "boolean" })
  tech: boolean;

  @OneToMany(() => DeductedPoints, (deductedPoints) => deductedPoints.match, {
    cascade: true,
  })
  @ApiProperty({ type: () => [DeductedPoints] })
  deductedPointsList?: DeductedPoints[];
}

@Entity()
export class Match extends BaseMatch implements MatchInterface {
  @ManyToOne(() => Stage, { nullable: false })
  @ApiProperty({ type: () => Stage })
  stage: Stage;
}
