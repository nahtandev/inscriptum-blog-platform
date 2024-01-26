import { createClient } from "redis";

export interface RedisClientConfig {
  host: string;
  port: number;
  password: string;
}

export class JwtBlackList {
  #password: string;
  #port: number;
  #host: string;

  constructor({ password, host, port }: RedisClientConfig) {
    this.#password = password;
    this.#host = host;
    this.#port = port;
  }

  redisClient() {
    const client = createClient({
      password: this.#password,
      socket: {
        host: this.#host,
        port: this.#port,
      },
    });

    return client;
  }

  async init() {
    try {
      const redis = await this.redisClient().connect();
      console.info("[jwt-redis] connection to redis store init succeful");
      await redis.quit();
    } catch (error) {
      throw new Error(
        `[jwt-redis] failed  to init connection on redis store: ${error}`
      );
    }
  }

  async addToken(jwtId: string, expireTime: number) {
    try {
      const redis = await this.redisClient().connect();
      await redis.set(jwtId, expireTime, {
        EXAT: expireTime,
      });
      await redis.quit();
    } catch (error) {
      throw new Error(
        `[jwt-redis] failed to set jwt token identifier in black list: ${error}`
      );
    }
  }

  async getToken(jwtId: string): Promise<string | undefined> {
    try {
      const redis = await this.redisClient().connect();
      const tokenExist = await redis.exists(jwtId);
      if (tokenExist === 0) return undefined;

      const tokenPayload = await redis.get(jwtId);
      await redis.quit();
      return tokenPayload;
    } catch (error) {
      throw new Error(
        `[jwt-redis] failed to get jwt token identifier from black list: ${error}`
      );
    }
  }
}
