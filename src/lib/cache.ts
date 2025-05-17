import { Redis } from '@upstash/redis';
import type { RedisClient } from '@/lib/redis';

// Initialize Redis client
let redisClient: Redis | RedisClient;

// Initialize Redis client if REDIS_URL is available
if (process.env.REDIS_URL) {
  redisClient = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN || '',
  });
} else {
  // Mock implementation for development without Redis
  console.warn('Redis URL not provided. Using mock implementation.');
  
  const mockCache = new Map<string, string>();
  
  redisClient = {
    get: async (key: string) => {
      return mockCache.get(key) || null;
    },
    set: async (key: string, value: string, options?: { EX?: number, PX?: number }) => {
      mockCache.set(key, value);
      if (options?.EX) {
        setTimeout(() => mockCache.delete(key), options.EX * 1000);
      } else if (options?.PX) {
        setTimeout(() => mockCache.delete(key), options.PX);
      }
      return 'OK';
    },
    setex: async (key: string, seconds: number, value: string) => {
      mockCache.set(key, value);
      setTimeout(() => mockCache.delete(key), seconds * 1000);
    },
    del: async (keys: string | string[]) => {
      if (typeof keys === 'string') {
        mockCache.delete(keys);
        return 1;
      } else {
        let count = 0;
        for (const key of keys) {
          if (mockCache.delete(key)) {
            count++;
          }
        }
        return count;
      }
    },
    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(mockCache.keys()).filter(key => regex.test(key));
    }
  };
}

// Cache manager for repository analysis
export const cacheManager = {
  // Check if analysis exists in cache
  async checkCache(repoUrl: string, type: 'repository' | 'file' | 'directory', path: string | null = null) {
    let cacheKey: string;
    
    if (type === 'repository') {
      cacheKey = `repo:${repoUrl}:summary`;
    } else if (type === 'file') {
      cacheKey = `repo:${repoUrl}:files:${path}`;
    } else {
      cacheKey = `repo:${repoUrl}:dirs:${path}`;
    }
    
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData as string) : null;
  },
  
  // Store analysis in cache
  async storeInCache(
    repoUrl: string, 
    type: 'repository' | 'file' | 'directory', 
    data: any, 
    path: string | null = null, 
    ttl = 86400
  ) {
    let cacheKey: string;
    
    if (type === 'repository') {
      cacheKey = `repo:${repoUrl}:summary`;
    } else if (type === 'file') {
      cacheKey = `repo:${repoUrl}:files:${path}`;
    } else {
      cacheKey = `repo:${repoUrl}:dirs:${path}`;
    }
    
    await redisClient.setex(cacheKey, ttl, JSON.stringify(data));
  },
  
  // Invalidate cache entries
  async invalidateCache(repoUrl: string, type: 'repository' | 'file' | 'directory' | null = null, path: string | null = null) {
    if (!type) {
      // Invalidate all cache for this repo
      const keys = await redisClient.keys(`repo:${repoUrl}:*`);
      if (keys.length > 0) {
        // Delete each key individually since the mock implementation doesn't support arrays
        for (const key of keys) {
          await redisClient.del(key);
        }
      }
    } else if (type === 'repository') {
      await redisClient.del(`repo:${repoUrl}:summary`);
    } else if (type === 'file' && path) {
      await redisClient.del(`repo:${repoUrl}:files:${path}`);
    } else if (type === 'directory' && path) {
      await redisClient.del(`repo:${repoUrl}:dirs:${path}`);
      // Also invalidate all files under this directory
      const keys = await redisClient.keys(`repo:${repoUrl}:files:${path}/*`);
      if (keys.length > 0) {
        // Delete each key individually since the mock implementation doesn't support arrays
        for (const key of keys) {
          await redisClient.del(key);
        }
      }
    }
  }
} as const;
