# El Chapuzas Discord Bot

Bot de Discord que notifica nuevas publicaciones de ElChapuzasInformático.

## Configuración

1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Copia `.env.example` a `.env` y configura las variables
4. Ejecuta el bot con `npm start`

## Variables de Entorno

- `DISCORD_TOKEN`: Token de tu bot de Discord
- `NEWS_URL`: URL del sitio web a scrapear
- `CHECK_INTERVAL`: Intervalo de comprobación (formato cron)
- `BOT_PREFIX`: Prefijo para comandos (default: !)
- `CHANNEL_NAME`: Nombre del canal donde enviará mensajes

## Comandos

- `!ultima` - Muestra la última noticia
- `!ayuda` - Muestra ayuda de comandos
- `!contecte` - Comprueba si el bot está funcionando
