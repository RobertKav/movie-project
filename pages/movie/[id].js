// pages/movie/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';


export default function MoviePage() {
const router = useRouter();
const { id } = router.query;
const [movie, setMovie] = useState(null);
const [reviews, setReviews] = useState([]);
const [form, setForm] = useState({ rating: '', text: '' });


useEffect(() => {
if (!id) return;
// fetch details from TMDb via server route
fetch(`/api/search?q=${id}`) // small trick: TMDb search will still return movie details if id is numeric; but better to call TMDb movie detail endpoint server-side — keeping simple here
.then(r => r.json())
.then(j => {
const found = j.results?.find(r => String(r.id) === String(id));
setMovie(found || null);
});
// load reviews for this movie
fetch(`/api/reviews/${id}`)
.then(r => r.json())
.then(j => setReviews(j.reviews || []));


}, [id]);


async function submitReview(e) {
e.preventDefault();
const payload = {
movie_id: String(id),
movie_title: movie?.title || 'Unknown',
rating: form.rating ? Number(form.rating) : null,
review_text: form.text,
};


const res = await fetch('/api/review', {
method: 'POST',
headers: { 'content-type': 'application/json' },
body: JSON.stringify(payload),
});
const j = await res.json();
if (res.ok) {
// prepend new review in UI
setReviews(prev => [j.review, ...prev]);
setForm({ rating: '', text: '' });
} else {
alert('Error: ' + (j.error || 'unknown'));
}
}


return (
<div style={{ padding: 20 }}>
<button onClick={() => router.push('/')}>◀ Back</button>
<h1>{movie?.title || 'Movie'}</h1>
{movie?.poster_path && (
<img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt="poster" />
)}
<p>{movie?.overview}</p>
<hr />

<h2>Leave a review</h2>
<form onSubmit={submitReview}>
<label>
Rating (1-10):
<input type="number" min="1" max="10" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
</label>
<br />
<textarea rows={4} cols={50} value={form.text} onChange={e => setForm({...form, text: e.target.value})} placeholder="Write your thoughts..." />
<br />
<button type="submit">Submit review</button>
</form>
<hr />

<h2>Community reviews</h2>
{reviews.length === 0 && <p>No reviews yet.</p>}
<ul>
{reviews.map(r => (
<li key={r.id} style={{ marginBottom: 12 }}>
<strong>{r.rating ? `${r.rating}/10` : ''}</strong>
<div>{r.review_text}</div>
<div style={{ fontSize: 12, color: '#666' }}>sentiment: {r.sentiment_score}</div>
<div style={{ fontSize: 12, color: '#666' }}>{new Date(r.created_at).toLocaleString()}</div>
</li>
))}
</ul>
</div>
);
}
// pages/api/movie/[id].js
import { supabaseServer } from '../../../lib/supabaseServer'; // your server supabase client

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // 1) Try Supabase cache first
  try {
    const { data: cached, error: cacheErr } = await supabaseServer
      .from('movies_cache')
      .select('tmdb_json, poster_path, title, fetched_at')
      .eq('movie_id', String(id))
      .single();

    // Use cache if found and fresh (e.g., 7 days)
    if (cached) {
      const fetchedAt = new Date(cached.fetched_at);
      const ageDays = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 7) {
        return res.status(200).json({ movie: cached.tmdb_json, cached: true });
      }
    }
  } catch (e) {
    // ignore cache failures and proceed to fetch TMDb
    console.warn('cache check failed', e);
  }

  // 2) Fetch from TMDb
  const tmdbKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?api_key=${tmdbKey}&language=en-US&append_to_response=credits,reviews`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text });
    }
    const movie = await r.json();

    // 3) Upsert cache in Supabase
    try {
      await supabaseServer
        .from('movies_cache')
        .upsert({
          movie_id: String(id),
          title: movie.title,
          poster_path: movie.poster_path,
          tmdb_json: movie,
          fetched_at: new Date().toISOString()
        }, { onConflict: 'movie_id' });
    } catch (e) {
      console.warn('supabase cache upsert failed', e);
    }

    res.status(200).json({ movie, cached: false });
  } catch (err) {
    console.error('TMDb fetch error', err);
    res.status(500).json({ error: 'TMDb fetch failed' });
  }
}
