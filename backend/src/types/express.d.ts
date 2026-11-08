/**
 * Backend/src/types/express.d.ts
 *
 * Khai báo mở rộng kiểu Express.Request cho toàn bộ dự án FleetMonitor Backend.
 */

import { TokenUserPayload } from '../services/auth/tokenService';

declare global {
  namespace Express {
    interface Request {
      user?: TokenUserPayload;
    }
  }
}

export {};

