import { createClient } from 'redis';
import { RedisClientType } from 'redis/dist/lib/client';
import BaseCache from '../../classes/BaseCache';
import { IBaseKernelModule } from '../../lib';

type RedisClient = RedisClientType<any, any> | null;
/**
 * @class BaseRedisCache
 * Multichannel Redis Client
 */
export default abstract class BaseRedisCache extends BaseCache {
  client: RedisClient;

  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
    super(chanel, module);
    this.client = null;
  }

  /**
   * Start Redis client
   * @throws Error No Redis config found
   */
  async start(): Promise<void> {
    const config = this.getModule().getKernel().getGlobalConfig().db?.redis;
    if (!config) {
      throw new Error('NO REDIS CONFIG FOUND');
    }
    this.client = createClient({
      socket: {
        host: config.url,
        port: config.port,
        password: config.password,
      },
    });
    this.client.on('error', (err) => {
      this.error(err);
    });
    await this.client.connect();
    this.log('Started');
  }

  async set(key: string, val: string): Promise<void> {
    await this.client?.set(this.parseKey(key), val);
  }

  async get(key: string): Promise<string | undefined> {
    return this.client?.get(this.parseKey(key));
  }

  async delete(key: string): Promise<void> {
    await this.client?.del(this.parseKey(key));
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client?.expire(this.parseKey(key), seconds);
  }

  async exist(key: string): Promise<boolean> {
    const ex = await this.client?.exists(this.parseKey(key));
    return !!ex;
  }

  async clearAll(): Promise<void> {
    await this.client?.flushAll();
  }

  getRaw(): RedisClient {
    return this.client;
  }

  async stop(): Promise<void> {
    await this.client?.disconnect();
  }

  private parseKey(key: string): string {
    return `${this.chanel}:${key}`;
  }
}
