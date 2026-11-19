/**
 * Backend/src/types/modules.d.ts
 *
 * Ambient Type Declarations cho các thư viện Express Middleware:
 * - Cung cấp định nghĩa kiểu tạm thời khi dev environment chưa chạy `npm install` đầy đủ.
 * - Triệt tiêu lỗi đỏ "Cannot find module 'helmet'" hoặc "'cookie-parser'".
 */

declare module 'helmet' {
  import { RequestHandler } from 'express';
  function helmet(options?: any): RequestHandler;
  export default helmet;
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: any, options?: any): RequestHandler;
  export default cookieParser;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  export interface Options {
    [key: string]: any;
  }
  export default function rateLimit(options?: Options): RequestHandler;
}

