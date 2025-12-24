import mangoose from 'mongoose';
import { ENV } from '../lib/env.js';

export const connectDB = async () => {
  try {
    if (!ENV.DB_URL) {
      throw new Error('Database URL is not defined in environment variables');
    }
    const conn = await mangoose.connect(ENV.DB_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};