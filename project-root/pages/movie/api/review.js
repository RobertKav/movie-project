// pages/api/review.js
import { supabaseServer } from '../../lib/supabaseServer';


// Very small, naive sentiment function - replace with a proper API for production
function simpleSentiment(text) {
const pos = ['good','great','love','amazing','enjoy','fantastic','like','best','perfect'];
const neg = ['bad','terrible','hate','boring','worst','awful','dislike','poor','slow'];
const txt = text.toLowerCase();
let score = 0;
for (const p of pos) if (txt.includes(p)) score += 1;
for (const n of neg) if (txt.includes(n)) score -= 1;
// normalize roughly to -1..1
if (score === 0) return 0;
return Math.max(-1, Math.min(1, score / 5));
}


export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
const { movie_id, movie_title, rating, review_text } = req.body || {};
if (!movie_id || !review_text) return res.status(400).json({ error: 'Missing fields' });


// compute sentiment with naive function
const sentiment_score = simpleSentiment(review_text);


// insert into Supabase using service role key (server)
const { data, error } = await supabaseServer
.from('reviews')
.insert([{ movie_id, movie_title, rating: rating || null, review_text, sentiment_score }])
.select();


if (error) return res.status(500).json({ error: error.message });


res.status(200).json({ review: data[0] });
}