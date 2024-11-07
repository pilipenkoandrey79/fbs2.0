import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { City as CityInterface, NAME_FIELD_LENGTH } from "@fbs2.0/types";
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";

import { Country } from "../../country/entities/country.entity";
import { OldCityName } from "./old-city-name.entity";
import { Club } from "../../club/entities/club.entity";

@Entity()
@ApiExtraModels(OldCityName)
export class City implements CityInterface {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: "number" })
  id: number;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH })
  @ApiProperty({ type: "string" })
  name: string;

  @Column({ type: "varchar", length: NAME_FIELD_LENGTH, nullable: true })
  @ApiProperty({ type: "string" })
  name_ua?: string;

  @ManyToOne(() => Country)
  @ApiProperty()
  country: Country;

  @OneToMany(() => OldCityName, (oldName) => oldName.city, { cascade: true })
  @ApiPropertyOptional({ type: () => [OldCityName] })
  oldNames?: OldCityName[];

  @OneToMany(() => Club, (club) => club.city)
  @ApiPropertyOptional({ type: () => [Club] })
  clubs?: Club[];
}
