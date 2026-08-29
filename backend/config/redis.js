import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import dotenv from 'dotenv';
dotenv.config();

export const createRedisConnection = () => {
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost')) {
    try {
      const client = new Redis(process.env.REDIS_URL || {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null,
        enableOfflineQueue: false
      });
      client.on('error', () => {});
      return client;
    } catch (e) {
      const mock = new RedisMock();
      mock.on('error', () => {});
      return mock;
    }
  }
  const mockClient = new RedisMock();
  mockClient.on('error', () => {});
  return mockClient;
};

const redis = createRedisConnection();
export default redis;
