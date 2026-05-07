import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApiApp } from '../backend/api-app';

// Cache the app instance to reuse across function invocations
let cachedApp: Awaited<ReturnType<typeof createApiApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize the app once and cache it
    if (!cachedApp) {
      console.log('[API] Initializing Express app...');
      cachedApp = await createApiApp();
    }

    // Remove /api prefix from the path for internal routing
    const originalUrl = req.url;
    if (req.url?.startsWith('/api/')) {
      req.url = req.url.slice(4) || '/';
    }

    // Handle the request using the Express app
    // Express app will handle routing internally
    return new Promise<void>((resolve) => {
      cachedApp!(req as any, res as any);
      
      // Ensure response is sent
      if (!res.headersSent) {
        res.once('finish', () => resolve());
        res.once('close', () => resolve());
      } else {
        resolve();
      }
    });
  } catch (error) {
    console.error('[API] Handler Error:', error);
    
    // Only send response if headers haven't been sent
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An error occurred',
      });
    }
  }
}
