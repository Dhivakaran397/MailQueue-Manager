import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  lazyConnect: true
};

// Create real connection or fallback to mock
export const createRedisConnection = () => {
  try {
    const client = new Redis(redisOptions);
    client.on('error', () => {});
    return client;
  } catch (e) {
    return new RedisMock();
  }
};

const redis = createRedisConnection();
export default redis;
