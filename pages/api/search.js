// pages/api/search.js

export default async function handler(req, res) {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY not found in env' });
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const results = (data.results || []).map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      overview: movie.overview
    }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error('TMDb API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from TMDb' });
  }
}

