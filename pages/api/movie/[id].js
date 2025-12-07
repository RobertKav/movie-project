// pages/api/movie/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'TMDB_API_KEY not found in env' });

  try {
    const r = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);
    if (!r.ok) throw new Error('Failed to fetch movie');

    const movie = await r.json();
    res.status(200).json({ movie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}