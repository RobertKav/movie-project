// pages/api/search.js
import fetch from 'node-fetch';


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