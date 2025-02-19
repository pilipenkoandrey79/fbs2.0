import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import {
  NAME_FIELD_LENGTH,
  OldClubName as OldClubNameInterface,
} from "@fbs2.0/types";

import { Club } from "./club.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class OldClubName implements OldClubNameInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  public id!: number;

  @Column({ type: "varchar" })
  @ApiProperty({ type: "string" })
  public till: string;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH })
  @ApiProperty({ type: "string" })
  public name: string;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH, nullable: true })
  @ApiProperty({ type: "string" })
  public name_ua?: string;

  @ManyToOne(() => Club, { nullable: false })
  @ApiProperty({ type: () => Club })
  club: Club;
}
