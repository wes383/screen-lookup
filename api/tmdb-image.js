export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { path } = req.query;

  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  try {
    const imageUrl = `https://image.tmdb.org${path}`;
    
    const response = await fetch(imageUrl);

    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
    
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('TMDB Image Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch image from TMDB' });
  }
}
