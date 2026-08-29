import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';

const connection = createRedisConnection();

export const emailQueue = new Queue('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});
