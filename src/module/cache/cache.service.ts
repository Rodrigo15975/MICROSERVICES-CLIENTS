import { Inject, Injectable } from '@nestjs/common'
import { Cacheable } from 'cacheable'
import { CACHE_INSTANCE } from './cache.name'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_INSTANCE) private readonly cache: Cacheable) {}

  async get<T>(key: string) {
    return await this.cache.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number | string): Promise<void> {
    await this.cache.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key)
  }
}
