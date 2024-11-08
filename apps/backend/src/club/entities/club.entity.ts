import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Club as ClubInterface, NAME_FIELD_LENGTH } from "@fbs2.0/types";

import { City } from "../../city/entities/city.entity";
import { OldClubName } from "./old-club-name.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity()
export class Club implements ClubInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  public id!: number;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH })
  @ApiProperty({ type: "string" })
  public name: string;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH, nullable: true })
  @ApiProperty({ type: "string" })
  public name_ua?: string;

  @ManyToOne(() => City)
  @ApiProperty({ type: () => City })
  city: City;

  @OneToMany(() => OldClubName, (oldName) => oldName.club, { cascade: true })
  @ApiPropertyOptional({ type: () => [OldClubName] })
  oldNames?: OldClubName[];
}
