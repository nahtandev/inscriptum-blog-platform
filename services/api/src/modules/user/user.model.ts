import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("user")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  email: string;

  @Column({ type: "varchar", length: 50 })
  firstName: string;

  @Column({ type: "varchar", length: 50 })
  lastName: string;

  @Column({ type: "varchar", length: 128 })
  password: string;

  @Column({ type: "simple-array", length: 15 })
  roles: string[];

  @Column({ type: "varchar", length: 128, nullable: true })
  resetPasswordToken: string;

  @Column({ type: "bigint", nullable: true })
  tokenExpireAt: number;

  @Column({ type: "boolean" })
  isActive: boolean;
}

@Entity("publisher")
export class PublisherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({ type: "varchar", length: "50" })
  userName: string;

  @Column({ type: "varchar", length: 60, nullable: true })
  webSiteUrl?: string;

  @Column({ type: "simple-array", length: 60, nullable: true })
  socialMediasUrl?: string[];

  @Column({ type: "varchar", length: 1000, nullable: true })
  bio?: string;
}
