import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClubCoefficient as ClubCoefficientInterface } from "@fbs2.0/types";

import { Club } from "../../club/entities/club.entity";
import { TournamentSeason } from "../../shared/entities/tournament-season.entity";

@Entity()
export class ClubCoefficient implements ClubCoefficientInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Club, { nullable: true, onDelete: "CASCADE" })
  club: Club;

  @ManyToOne(() => TournamentSeason, { nullable: false, onDelete: "CASCADE" })
  tournamentSeason: TournamentSeason;

  @Column({ type: "real" })
  coefficient: number;
}
