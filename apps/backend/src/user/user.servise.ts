import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "./user.entity";
import { IGoogleUser } from "../auth/strategies/google.strategy";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  async createUserWithGoogle(googleUser: IGoogleUser): Promise<User> {
    const [userExists] = await this.findByEmail(googleUser.email);

    if (userExists) {
      throw new BadRequestException("User already exists");
    }

    const user = new User();

    user.email = googleUser.email;
    user.refreshToken = googleUser.refreshToken;

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User[]> {
    if (!email) {
      throw new NotFoundException("user not found");
    }

    const users = await this.usersRepository.find({
      where: { email },
    });

    return users;
  }

  async findOneById(id: number): Promise<User> {
    if (!id) {
      throw new NotFoundException("user not found");
    }

    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("user not found");
    }

    return user;
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("user not found");
    }

    Object.assign(user, attrs);

    return await this.usersRepository.save(user);
  }
}
