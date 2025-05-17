declare module 'jsonwebtoken';
declare module 'bcrypt';
declare module 'd3';

// Add this to make TypeScript happy with bcrypt
interface BcryptModule {
  compare(data: string, encrypted: string): Promise<boolean>;
  hash(data: string, saltOrRounds: string | number): Promise<string>;
}

declare module 'bcrypt' {
  const bcrypt: BcryptModule;
  export = bcrypt;
}

declare module '@/lib/prisma' {
  export function getAnalysisById(id: string): Promise<Analysis>;
  export function deleteAnalysis(id: string): Promise<void>;
}

declare module '@/lib/redis' {
  import { Redis } from '@upstash/redis';
  
  export interface RedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { EX?: number, PX?: number }): Promise<string>;
    setex(key: string, seconds: number, value: string): Promise<void>;
    del(keys: string | string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
  }

  const redisClient: Redis | RedisClient;
  export default redisClient;

  export const cacheManager: {
    checkCache(repoUrl: string, type: 'repository' | 'file' | 'directory', path?: string | null): Promise<any>;
    storeInCache(repoUrl: string, type: 'repository' | 'file' | 'directory', data: any, path?: string | null, ttl?: number): Promise<void>;
    invalidateCache(repoUrl: string, type?: 'repository' | 'file' | 'directory' | null, path?: string | null): Promise<void>;
  };
}

export interface Analysis {
  id: string;
  repoUrl: string;
  repoName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  summary: string;
  features: Record<string, any>;
  architecture: Record<string, any>;
  codeStats: Record<string, any>;
  analysisItems: AnalysisItem[];
  bookmarked: boolean;
}

export interface AnalysisItem {
  id: string;
  analysisId: string;
  path: string;
  type: 'FILE' | 'DIRECTORY';
  summary?: string;
  content?: string;
  features?: Record<string, any>;
  complexity?: number;
  createdAt: Date;
}

export interface NextRequest {
  nextUrl: {
    searchParams: URLSearchParams;
  };
}

export interface Node {
  name: string;
  type: string;
  x: number;
  y: number;
  children?: boolean;
  data?: {
    name: string;
    type: string;
  };
}

export interface Link {
  source: Node;
  target: Node;
  strength: number;
}

export interface D3Event {
  zoom: (event: any) => void;
}
