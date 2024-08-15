import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {
  StageScheme as StageSchemeInterface,
  StageSchemeType,
} from "@fbs2.0/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity()
export class StageScheme implements StageSchemeInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @Column({ type: "enum", enum: StageSchemeType, nullable: false })
  @ApiProperty({ enum: StageSchemeType })
  type: StageSchemeType;

  @Column({ type: "boolean", default: false })
  @ApiProperty({ type: "boolean" })
  isStarting: boolean;

  @Column({ type: "integer", nullable: true })
  @ApiPropertyOptional({ type: "number" })
  groups?: number;

  @Column({ type: "boolean", default: true, nullable: true })
  @ApiProperty({ type: "boolean" })
  pen: boolean;

  @Column({ type: "boolean", default: false })
  @ApiProperty({ type: "boolean" })
  awayGoal: boolean;

  @Column({ type: "integer", nullable: true })
  @ApiPropertyOptional({ type: "number" })
  swissNum?: number;
}
