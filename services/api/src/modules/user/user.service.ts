import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PublisherEntity, UserEntity } from "./user.model";

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  resetPasswordToken: string;
  tokenExpireAt: number;
  isActive: boolean;
  publicId: string;
}

interface CreatePublisherPayload {
  user: UserEntity;
  userName: string;
  webSiteUrl?: string;
  socialMediasUrl?: string[];
  bio?: string;
  publicId: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PublisherEntity)
    private publisherRepository: Repository<PublisherEntity>
  ) {}

  async createUser(payload: CreateUserPayload) {
    return this.userRepository.save(payload);
  }

  async updateOneUser(id: number, payload: CreateUserPayload) {
    return this.userRepository.update(id, payload);
  }

  async getOneUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        resetPasswordToken: true,
        tokenExpireAt: true,
        isActive: true,
        publicId: true,
      },
      where: {
        email,
      },
    });
  }

  async getOneUserById(id: number, withPassword = false) {
    return this.userRepository.findOne({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        resetPasswordToken: true,
        tokenExpireAt: true,
        isActive: true,
        password: withPassword,
        publicId: true,
      },
      where: { id },
    });
  }

  async getOneUserByPublicId(publicId: string, withPassword = false) {
    return this.userRepository.findOne({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        resetPasswordToken: true,
        tokenExpireAt: true,
        isActive: true,
        password: withPassword,
        publicId: true,
      },
      where: { publicId },
    });
  }

  async createPublisher(payload: CreatePublisherPayload) {
    return this.publisherRepository.save(payload);
  }

  async getOnePublisherByUserId(userId: number) {
    return this.publisherRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }
}
