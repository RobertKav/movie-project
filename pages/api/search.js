// pages/api/search.js
const res = await fetch(url)
const data = await res.json()


export default async function handler(req, res) {
const { q } = req.query;
if (!q) return res.status(400).json({ error: 'Missing q param' });


const tmdbKey = process.env.TMDB_API_KEY;
const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(q)}`;


const r = await fetch(url);
const data = await r.json();
// Return the first 10 results
res.status(200).json({ results: data.results?.slice(0, 10) || [] });
}
// pages/api/search.js
// server-side: calls TMDb search and returns results
import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  const q = req.query.q || req.url.split('?q=')[1] || '';
  if (!q) return res.status(400).json({ error: 'Missing q param' });

  const tmdbKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    // return minimal fields to client
    const results = (data.results || []).map(m => ({
      id: m.id,
      title: m.title,
      release_date: m.release_date,
      poster_path: m.poster_path,
      overview: m.overview
    }));
    res.status(200).json({ results });
  } catch (err) {
    console.error('TMDb search error', err);
    res.status(500).json({ error: 'TMDb search failed' });
  }
}
