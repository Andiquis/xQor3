import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'xqor3-secret-key-change-in-production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}));
