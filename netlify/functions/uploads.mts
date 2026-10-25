import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Serves files uploaded through the admin dashboard
export default async (_req: Request, context: Context) => {
  const key = context.params.key;
  const result = await getStore('uploads').getWithMetadata(key, { type: 'stream' });
  if (!result) {
    return new Response('File tidak ditemukan.', { status: 404 });
  }

  return new Response(result.data, {
    headers: {
      'Content-Type': (result.metadata.contentType as string) || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox"
    }
  });
};

export const config: Config = {
  path: '/uploads/:key'
};
