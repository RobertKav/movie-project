// pages/movie/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function MoviePage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    // fetch movie details from your server API
    setLoading(true);
    fetch(`/api/movie/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.movie) setMovie(j.movie);
      })
      .catch((e) => console.error('movie fetch error', e))
      .finally(() => setLoading(false));

    // fetch reviews for this movie
    fetch(`/api/reviews/${id}`)
      .then((r) => r.json())
      .then((j) => setReviews(j.reviews || []))
      .catch((e) => console.error('reviews fetch error', e));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    if (!form.text) return alert('Please write a review');

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
      setReviews((prev) => [j.review, ...prev]);
      setForm({ rating: '', text: '' });
    } else {
      alert('Error saving review: ' + (j.error || 'unknown'));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push('/')}>◀ Back</button>
      {loading && <div>Loading...</div>}

      {movie ? (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <div>
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                style={{ width: 300, borderRadius: 6 }}
              />
            ) : (
              <div style={{ width: 300, height: 450, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No poster
              </div>
            )}
          </div>

          <div style={{ maxWidth: 700 }}>
            <h1>{movie.title} <span style={{ fontWeight: 400, color: '#666' }}>({movie.release_date?.slice(0,4) || '—'})</span></h1>
            <p style={{ color: '#333' }}>{movie.overview}</p>

            <hr />

            <h2>Leave a review</h2>
            <form onSubmit={submitReview}>
              <label>
                Rating (1-10):
                <input type="number" min="1" max="10" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={{ marginLeft: 8 }} />
              </label>
              <br />
              <textarea rows={4} cols={60} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Write your thoughts..." style={{ marginTop: 8 }} />
              <br />
              <button type="submit" style={{ marginTop: 8 }}>Submit review</button>
            </form>

            <hr />

            <h2>Community reviews</h2>
            {reviews.length === 0 && <p>No reviews yet.</p>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reviews.map((r) => (
                <li key={r.id} style={{ marginBottom: 16, padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
                  <div style={{ fontWeight: 600 }}>{r.rating ? `${r.rating}/10` : '—'}</div>
                  <div style={{ marginTop: 6 }}>{r.review_text}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                    sentiment: {typeof r.sentiment_score === 'number' ? r.sentiment_score.toFixed(2) : r.sentiment_score}
                    &nbsp; • &nbsp; {new Date(r.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        !loading && <div>Movie not found.</div>
      )}
    </div>
  );
}