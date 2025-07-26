import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    const envCheck = {
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      EMAIL_API_KEY: !!process.env.EMAIL_API_KEY,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER
    };

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 