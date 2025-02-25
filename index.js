require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { fetchLatestNews } = require("./scraper");
const cron = require("node-cron");

// Crea el cliente con los intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Para gestionar servidores
    GatewayIntentBits.GuildMessages, // Para leer mensajes en servidores
    GatewayIntentBits.MessageContent, // Para acceder al contenido de los mensajes
  ],
});

// Prefijo de comandos
const prefix = process.env.BOT_PREFIX;

function createNewsMessage(news, isUpdate = false) {
  const prefix = isUpdate ? "🆕 ¡Nueva noticia!" : "📰 Última noticia:";
  return `${prefix}\n**${news.title}**\n${news.url}`;
}

function getTimestamp() {
  return `[${new Date().toLocaleTimeString()}]`;
}

// Cuando el bot se conecte
client.once("ready", async () => {
  console.log(`${getTimestamp()} 🤖 Bot conectado como ${client.user.tag}`);
  console.log(`${getTimestamp()} 🔄 Obteniendo última noticia...`);

  const news = await fetchLatestNews(true);
  const channel = client.channels.cache.find((channel) => channel.name === process.env.CHANNEL_NAME);

  if (!channel) {
    console.error(`${getTimestamp()} ❌ No se encontró el canal 'general'`);
  } else {
    console.log(`${getTimestamp()} ✅ Canal 'general' encontrado`);
    if (news.length > 0) {
      console.log(`${getTimestamp()} 📨 Enviando última noticia al canal...`);
      await channel.send(createNewsMessage(news[0]));
    }
  }

  // Comprobar noticias cada 10 minutos
  cron.schedule(process.env.CHECK_INTERVAL, async () => {
    console.log(`\n${getTimestamp()} ⏰ Comprobación programada de noticias...`);
    const news = await fetchLatestNews();
    if (news.length > 0 && channel) {
      console.log(`${getTimestamp()} 📨 Enviando ${news.length} nuevas noticias al canal...`);
      for (const article of news.reverse()) {
        await channel.send(createNewsMessage(article, true));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  });
});

// Escucha por mensajes
client.on("messageCreate", (message) => {
  // Ignorar mensajes que no comiencen con el prefijo o sean de bots
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Separa el comando y los argumentos
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "ultima":
      fetchLatestNews().then((news) => {
        if (news.length > 0) {
          message.channel.send(createNewsMessage(news[0]));
        } else {
          message.channel.send("No hay noticias nuevas disponibles.");
        }
      });
      break;

    case "ayuda":
      message.channel.send(`
Comandos disponibles:
\`${prefix}ultima\` - Muestra la última noticia
\`${prefix}ayuda\` - Muestra este mensaje de ayuda
\`${prefix}contecte\` - Comprueba si el bot está funcionando
      `);
      break;

    case "contecte":
      message.channel.send("¡El bot está conectado y funcionando!");
      break;
  }
});

// Inicia sesión con el token del bot
client.login(process.env.DISCORD_TOKEN);
