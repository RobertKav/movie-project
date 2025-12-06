// pages/api/reviews/[movieId].js
import { supabaseServer } from '../../../lib/supabaseServer';


export default async function handler(req, res) {
const { movieId } = req.query;
if (!movieId) return res.status(400).json({ error: 'Missing movieId' });


const { data, error } = await supabaseServer
.from('reviews')
.select('*')
.eq('movie_id', movieId)
.order('created_at', { ascending: false });


if (error) return res.status(500).json({ error: error.message });
res.status(200).json({ reviews: data });
}