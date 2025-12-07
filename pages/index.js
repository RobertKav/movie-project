// pages/index.js
import { useState } from 'react';


export default function Home() {
const [q, setQ] = useState('');
const [results, setResults] = useState([]);


async function doSearch(e) {
e && e.preventDefault();
const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
const json = await res.json();
setResults(json.results || []);
}


return (
<div style={{ padding: 20 }}>
<h1>Movie search</h1>
<form onSubmit={doSearch}>
<input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a movie" />
<button type="submit">Search</button>
</form>


<ul>
{results.map(movie => (
<li key={movie.id}>
<a href={`/movie/${movie.id}`}>{movie.title} ({movie.release_date?.slice(0,4)})</a>
</li>
))}
</ul>
</div>
);
}
async function doSearch(q) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const json = await res.json();
  return json.results || [];
}

// render
{results.map(m => (
  <div key={m.id}>
    <a href={`/movie/${m.id}`}>
      <img src={m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : '/no-poster.png'} alt={m.title} />
      <div>{m.title} ({m.release_date?.split('-')[0]})</div>
    </a>
  </div>
))}
