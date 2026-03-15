import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const res = await axios.get('https://openrouter.ai/api/v1/models', {
  headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
});

const freeModels = res.data.data.filter(m => m.id.includes(':free'));
freeModels.forEach(m => console.log(m.id));