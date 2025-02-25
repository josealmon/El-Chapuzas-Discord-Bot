require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const NEWS_URL = process.env.NEWS_URL;
let sentUrls = new Set(); // Guardar URLs ya enviadas
const MAX_STORED_URLS = 22; // Máximo de URLs a almacenar

function getTimestamp() {
  return `[${new Date().toLocaleTimeString()}]`;
}

function limitStoredUrls() {
  if (sentUrls.size > MAX_STORED_URLS) {
    const urlsArray = Array.from(sentUrls);
    const toRemove = urlsArray.slice(0, sentUrls.size - MAX_STORED_URLS);
    toRemove.forEach((url) => sentUrls.delete(url));
    console.log(`${getTimestamp()} 🧹 Cache limpiado: ${toRemove.length} URLs antiguas eliminadas`);
  }
}

async function fetchLatestNews(isInitialFetch = false) {
  console.log(`${getTimestamp()} 🔍 Buscando noticias en ElChapuzasInformático...`);
  try {
    const { data } = await axios.get(NEWS_URL);
    const $ = cheerio.load(data);

    const articles = [];
    $("article.blog-item").each((i, element) => {
      const $article = $(element);
      const title = $article.find("h2.entry-title a").text().trim();
      const url = $article.find("h2.entry-title a").attr("href");

      if (!sentUrls.has(url)) {
        articles.push({ title, url, isNew: true });
      }
    });

    if (articles.length > 0) {
      if (isInitialFetch) {
        // Guardar todas las URLs existentes sin enviarlas
        articles.forEach((article) => sentUrls.add(article.url));
        limitStoredUrls(); // Limitar URLs después de la carga inicial
        // Solo retornar la última noticia
        console.log(`${getTimestamp()} 📰 Última noticia: ${articles[0].title}`);
        console.log(`${getTimestamp()} 🔗 URL: ${articles[0].url}`);
        return [articles[0]];
      } else {
        // Para actualizaciones posteriores
        console.log(`${getTimestamp()} 🆕 ${articles.length} nuevas noticias encontradas!`);
        articles.forEach((article) => {
          console.log(`${getTimestamp()} 📰 Título: ${article.title}`);
          console.log(`${getTimestamp()} 🔗 URL: ${article.url}`);
          sentUrls.add(article.url);
        });
        limitStoredUrls(); // Limitar URLs después de añadir nuevas
      }
    } else {
      console.log(`${getTimestamp()} ℹ️ No hay noticias nuevas`);
    }

    return articles;
  } catch (error) {
    console.error(`${getTimestamp()} ❌ Error al buscar noticias:`, error.message);
    return [];
  }
}

module.exports = { fetchLatestNews };
