import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function scrapeWebsite(url) {
  const { data } = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' }
  });
  const $ = cheerio.load(data);
  $('script, style, nav, footer, header, iframe').remove();
  return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000);
}

app.post('/api/chat', async (req, res) => {
  const { url, question } = req.body;

  if (!url || !question) {
    return res.status(400).json({ error: 'URL and question are required.' });
  }

  try {
    const pageContent = await scrapeWebsite(url);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
  role: 'system',
  content: `You are a knowledgeable and thorough assistant. Answer questions based on the website content provided.
  
Follow these rules:
- Give detailed, well-structured answers with multiple paragraphs when needed
- Use bullet points or numbered lists to break down complex information
- Include relevant examples, facts, dates, and context from the page
- If the topic has multiple aspects, cover each one clearly
- Minimum 3-4 sentences per answer, more for complex questions
- If the answer is not found in the content, say "I could not find that information on this page"
- End your answer with a short "Summary:" line for long answers`
},
        {
          role: 'user',
          content: `Website URL: ${url}\n\nWebsite content:\n${pageContent}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 2048,
      temperature: 0.7
    });

    const answer = response.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});