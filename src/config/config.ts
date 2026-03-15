import ms from "ms";

export const configuration = {
  environment: (process.env.NODE_ENV as string) || "development",  
  jwt: {
    secret: (process.env.JWT_SECRET as string) || "super-secret-app",    
    accessExpired: (process.env.ACCESS_TOKEN_EXPIRED as ms.StringValue) || "15m",
    refreshExpired: (process.env.REFRESH_TOKEN_EXPIRED as ms.StringValue) || "7d",
  },
  port: process.env.PORT || 3000,
  timezone: (process.env.TZ as string) || "UTC",
  maxAttempts: Number(process.env.MAX_ATTEMPTS) || 5,
  lockTime: ms(process.env.LOCK_TIME as ms.StringValue) || 15 * 60 * 1000 // 15 minutes
};