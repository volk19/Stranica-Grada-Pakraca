const express = require('express');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cheerio = require('cheerio');

const cors = require('cors');
const app = express();
const port = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100, // max 100 zahtjeva po IP
  message: 'Previše zahtjeva, pokušajte kasnije.'
});
app.use('/api/', limiter);
app.use(cors());

const dbConfig = {
  host: 'ucka.veleri.hr',
  user: 'mmustran',
  password: '11',
  database: 'mmustran'
};


app.get('/api/novosti', async (req, res) => {
  try {
    // URL stranice za vijesti
    const url = 'https://pakrac.hr/category/novosti/';

    // Dohvaćanje HTML-a stranice
    const response = await axios.get(url);
    const html = response.data;

    // Parsiranje HTML-a pomoću Cheerio
    const $ = cheerio.load(html);

    // Selektori vijesti (prilagodite prema strukturi stranice)
    const novosti = [];
    $('.post').each((i, element) => {
      const title = $(element).find('.entry-title a').text().trim(); // Naslov
      const excerpt = $(element).find('.entry-content').text().trim(); // Kratki opis ili sadržaj
      const link = $(element).find('.entry-title a').attr('href'); // Link na cijelu novost

      novosti.push({ title, excerpt, link });
    });


    const page = parseInt(req.query.page) || 1; // Broj stranice, podrazumevano 1
    const limit = 5; // Maksimalno 15 novosti po stranici
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Segmentiranje vijesti za trenutnu stranicu
    const paginatedNovosti = novosti.slice(startIndex, endIndex);

    // Vraćanje rezultata i metapodataka paginacije
    res.json({
      total: novosti.length, // Ukupan broj vijesti
      page,
      limit,
      totalPages: Math.ceil(novosti.length / limit), // Ukupan broj stranica
      novosti: paginatedNovosti, // Vijesti za trenutnu stranicu
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dohvaćanju vijesti' });
  }
});

app.get('/api/eventi', async (req, res) => {
  try {
    // URL stranice za događaje
    const url = 'https://tz-pakrac.hr/novosti/';

    // Dohvaćanje HTML-a stranice
    const response = await axios.get(url);
    const html = response.data;

    // Parsiranje HTML-a pomoću Cheerio
    const $ = cheerio.load(html);

    const eventi = [];

    // Selektori za događaje (prilagodite prema strukturi stranice)
    $('.post').each((i, element) => {
      const title = $(element).find('h2 a').text().trim(); // Naslov događaja
      const excerpt = $(element).find('.entry-summary').text().trim(); // Kratak opis događaja
      const link = $(element).find('h2 a').attr('href'); // Link na cijeli događaj

      if (title) {
        eventi.push({ title, excerpt, link });
      }
    });

    const page = parseInt(req.query.page) || 1; // Trenutna stranica (default 1)
    const limit = 5; // Maksimalan broj događaja po stranici
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Segmentiranje događaja za trenutnu stranicu
    const paginatedEventi = eventi.slice(startIndex, endIndex);

    // Vraćanje rezultata i metapodataka paginacije
    res.json({
      total: eventi.length, // Ukupan broj događaja
      page,
      limit,
      totalPages: Math.ceil(eventi.length / limit), // Ukupan broj stranica
      eventi: paginatedEventi, // Događaji za trenutnu stranicu
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju događaja:', err.message);
    res.status(500).json({ error: 'Greška pri dohvaćanju događaja' });
  }
});

app.listen(port, () => {
  console.log(`API radi na http://localhost:${port}`);
});

