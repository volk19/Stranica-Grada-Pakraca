const cheerio = require('cheerio');
const axios = require('axios');


(async () => {
  const url = 'https://pakrac.hr/category/novosti/';
  try {
    const response = await axios.get(url);
    const html = await response.data;

    const $ = cheerio.load(html);

    const novosti = [];
    $('.post').each((i, element) => {
      const title = $(element).find('.entry-title a').text().trim(); // Naslov
      const excerpt = $(element).find('.entry-content').text().trim(); // Kratki opis ili sadržaj
      const link = $(element).find('.entry-title a').attr('href'); // Link na cijelu novost

      novosti.push({ title, excerpt, link });
    });

    // Prikazivanje novosti u konzoli
    console.log(novosti);
  } catch (error) {
    console.error('Greška pri dohvaćanju novosti:', error);
  }
})();