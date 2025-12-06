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