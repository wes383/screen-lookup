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

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'TMDB API key not configured' });
    return;
  }

  try {
    const url = new URL(`https://api.themoviedb.org/3/${path}`);

    Object.keys(req.query).forEach(key => {
      if (key !== 'path') {
        url.searchParams.append(key, req.query[key]);
      }
    });

    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      res.status(response.status).json(errorData);
      return;
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    res.status(200).json(data);
  } catch (error) {
    console.error('TMDB API Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from TMDB' });
  }
}
