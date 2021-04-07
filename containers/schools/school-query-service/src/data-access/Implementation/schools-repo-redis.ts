import Redis from 'ioredis';
import { ICache } from '../ISchoolRepo';
import { createHash } from 'crypto';

export class RedisCache implements ICache {
  private redisConn;
  private static instance: ICache;
  private constructor() {
    if (process.env.NODE_ENV === 'production') {
      const sentinelConf = {
        sentinels: [
          {
            host: process.env.REDIS_SENTINEL_IP,
            port: process.env.REDIS_SENTINEL_PORT
          }
        ],
        name: process.env.REDIS_MASTER
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.redisConn = new Redis(sentinelConf);
    } else {
      this.redisConn = new Redis(
        parseInt(process.env.REDIS_PORT || '6379'),
        process.env.REDIS_HOST || 'localhost',
        {}
      );
    }

    this.redisConn.on('error', (err) =>
      console.log('Error connecting to Redis Cluster', err)
    );
    this.redisConn.on('connect', () =>
      console.log('Connected to Redis Server')
    );
  }
  public static getInstance(): ICache {
    if (!this.instance) {
      this.instance = new RedisCache();
    }

    return this.instance;
  }
  public static generateHashKey(query: string): string {
    return createHash('md5').update(query).digest('hex');
  }
  async get(key: string): Promise<any> {
    const valueS = await this.redisConn.get(key);
    if (valueS) {
      return JSON.parse(valueS);
    } else {
      return null;
    }
  }
  async set(key: string, value: any): Promise<any> {
    try {
      let redisO = value;
      if (typeof value === 'object') redisO = JSON.stringify(value);
      // Set a TTL of 10 minutes
      const res = await this.redisConn.set(key, redisO, 'ex', 1 * 60 * 10);
      return res;
    } catch (error) {
      console.log('Unable to store Data in Redis');
      return;
    }
  }
  async delete(key: string): Promise<any> {
    return await this.redisConn.delete(key);
  }
}
