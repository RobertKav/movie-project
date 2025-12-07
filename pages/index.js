// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const doSearch = async (e) => {
    e?.preventDefault();
    if (!query) return;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        console.error('Search API error', await res.text());
        return;
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Fetch failed', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Movie search</h1>

      <form onSubmit={doSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a movie"
          style={{ padding: 8, width: 300 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '8px 12px' }}>
          Search
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        {results.length === 0 && <p>No results yet.</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          {results.map((m) => (
            <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <a href={`/movie/${m.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : '/no-poster.png'}
                  alt={m.title}
                  style={{ width: 80, height: 'auto', objectFit: 'cover', borderRadius: 4 }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{m.release_date?.slice(0, 4) || '—'}</div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
