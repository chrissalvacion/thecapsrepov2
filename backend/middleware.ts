import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle Vercel-specific request properties
 * Ensures compatibility between Express and Vercel serverless functions
 */
export function vercelMiddleware(req: Request, res: Response, next: NextFunction) {
  // Ensure response.status() always returns the res object
  if (!res.headersSent) {
    const originalStatus = res.status;
    res.status = function(code: number) {
      if (!res.headersSent) {
        res.statusCode = code;
      }
      return res;
    };
  }

  // Set headers to prevent caching on Vercel
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Remove server identification for security
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.status(200).end();
  }

  next();
}

/**
 * Middleware to handle Vercel request timeout
 * Vercel has a max function duration (30 seconds for hobby, 60 seconds for pro)
 */
export function timeoutHandler(timeoutMs: number = 25000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Service Timeout',
          message: 'Request took too long to process',
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}

/**
 * Middleware to parse numeric port from NODE_PORT environment variable
 * Used in Vercel serverless environment
 */
export function getServerPort(): number {
  const port = process.env.PORT || process.env.SERVER_PORT;
  if (port) {
    const parsed = parseInt(port, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return 3000;
}

/**
 * Get allowed CORS origins based on environment
 */
export function getAllowedCorsOrigins(): string[] {
  if (process.env.NODE_ENV === 'production') {
    // In production, be more restrictive
    const origins = process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : [];

    // Add Vercel preview domains if in preview
    if (process.env.VERCEL_BRANCH_URL) {
      origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
    }

    return origins.length > 0 ? origins : ['*'];
  }

  // In development, allow all origins
  return ['*'];
}

/**
 * Middleware to validate required environment variables
 */
export function validateEnvironment(): string[] {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  const missing = required.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return missing;
}

/**
 * Get environment-aware configuration
 */
export function getEnvironmentConfig() {
  return {
    isProduction: process.env.NODE_ENV === 'production',
    isVercel: !!process.env.VERCEL,
    isCold: !!process.env.VERCEL_DEPLOYMENT_ID,
    isPreview: process.env.VERCEL_ENV === 'preview',
    isDevelopment: process.env.NODE_ENV === 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    port: getServerPort(),
  };
}
