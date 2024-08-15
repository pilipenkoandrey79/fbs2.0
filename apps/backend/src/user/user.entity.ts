import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { User as UserInterface } from "@fbs2.0/types";

@Entity()
export class User implements UserInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column({ nullable: true })
  refreshToken: string;
}
