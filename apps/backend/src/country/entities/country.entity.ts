import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Country as CounntryInterface } from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Country implements CounntryInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @Column({ type: "varchar", length: 120 })
  @ApiProperty({ type: "string" })
  name: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  @ApiProperty({ type: "string" })
  name_ua?: string;

  @Column({ type: "varchar", length: 6 })
  @ApiProperty({ type: "string" })
  code: string;

  @Column({ type: "varchar", length: 4, nullable: true })
  @ApiProperty({ type: "string" })
  from: string;

  @Column({ type: "varchar", length: 4, nullable: true })
  @ApiProperty({ type: "string" })
  till: string;
}
