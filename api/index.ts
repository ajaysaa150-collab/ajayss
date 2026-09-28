import express, { Request, Response } from 'express';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();

// Allow large image uploads (up to 30MB base64)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared Gemini Client with telemetry user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. Start Video Generation
 * POST /api/generate-video
 * Uses veo-3.1-fast-generate-preview to animate a customer/coffee photo into a video
 */
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { image, mimeType = 'image/jpeg', prompt, aspectRatio = '16:9', resolution = '720p' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required to animate into video' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    // Clean base64 data if it includes a data URL prefix
    let cleanBase64 = image;
    let detectedMime = mimeType;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        cleanBase64 = match[2];
      }
    }

    // Ensure aspect ratio is valid: '16:9' or '9:16'
    const finalAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    // Model specified by prompt: veo-3.1-fast-generate-preview
    const defaultPrompt = 'A warm, cinematic coffee shop scene bringing this photo to life with gentle steam rising, soft atmospheric café lighting, and smooth slow-motion camera movement.';
    const finalPrompt = prompt && prompt.trim().length > 0 ? prompt.trim() : defaultPrompt;

    console.log(`[Veo Video] Starting generation with model veo-3.1-fast-generate-preview, aspect ratio: ${finalAspectRatio}`);

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: detectedMime || 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: resolution === '1080p' ? '1080p' : '720p',
        aspectRatio: finalAspectRatio,
      },
    });

    console.log(`[Veo Video] Operation started: ${operation.name}`);
    return res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error('[Veo Video] Error starting generation:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to start video generation with Veo',
      details: err?.toString(),
    });
  }
});

/**
 * 2. Poll Video Generation Status
 * POST /api/video-status
 */
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
      hasVideo: Boolean(updated.response?.generatedVideos?.[0]?.video?.uri),
    });
  } catch (err: any) {
    console.error('[Veo Video] Error polling status:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to check video status',
    });
  }
});

/**
 * 3. Download & Stream Generated Video
 * POST /api/video-download
 * Or GET /api/video-download?operationName=...
 */
const handleVideoDownload = async (req: Request, res: Response) => {
  try {
    const operationName = (req.body?.operationName || req.query?.operationName) as string;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or video generation incomplete' });
    }

    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || '',
      },
    });

    if (!videoRes.ok) {
      console.error('[Veo Video] Fetch video URI failed:', videoRes.status, videoRes.statusText);
      return res.status(videoRes.status).json({ error: 'Failed to download video file from storage' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="brew-bloom-animated.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('[Veo Video] Error streaming video:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to stream video',
    });
  }
};

app.post('/api/video-download', handleVideoDownload);
app.get('/api/video-download', handleVideoDownload);

export default app;
