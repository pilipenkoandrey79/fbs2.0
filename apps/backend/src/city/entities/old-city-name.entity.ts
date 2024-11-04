import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { OldCityName as OldCityNameInterface } from "@fbs2.0/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { City } from "./city.entity";
import { Country } from "../../country/entities/country.entity";

@Entity()
export class OldCityName implements OldCityNameInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  public id!: number;

  @Column({ type: "varchar" })
  @ApiProperty({ type: "string" })
  public till: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  @ApiPropertyOptional({ type: "string" })
  public name?: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  @ApiPropertyOptional({ type: "string" })
  public name_ua?: string;

  @ManyToOne(() => City, { nullable: false })
  @ApiProperty({ type: () => City })
  city: City;

  @ManyToOne(() => Country)
  @ApiPropertyOptional({ type: () => Country })
  country?: Country;
}
