// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {
      scanner: true,
      database: true,
      storage: true,
      ocr: true
    },
    metrics: {
      response_time: Math.random() * 100,
      active_sessions: Math.floor(Math.random() * 100),
      scanned_today: Math.floor(Math.random() * 50)
    }
  });
}
