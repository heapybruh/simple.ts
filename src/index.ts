import dotenv from "dotenv"
import { importx, dirname } from "@discordx/importer"
import { Console } from "./utils/console.js"
import { initEvents } from "./utils/events.js"
import { DiscordClient, MoonlinkClient } from "./utils/clients.js"
import { HexColorString } from "discord.js"
import { Client as Genius } from "genius-lyrics"

dotenv.config()

export const genius: Genius = new Genius(
  process.env.GENIUS_API_KEY ? process.env.GENIUS_API_KEY : undefined
)

export const color: HexColorString = `#${process.env.EMBED_COLOR}`

export const console = new Console()

export const bot = new DiscordClient(
  {
    intents: 131071,
    silent: true,
  },
  new MoonlinkClient(
    [
      {
        host: process.env.LAVA_HOST ? process.env.LAVA_HOST : `127.0.0.1`,
        port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : 2333,
        secure: false,
        password: process.env.LAVA_PASS
          ? process.env.LAVA_PASS
          : `youshallnotpass`,
      },
    ],
    {},
    (guildId: any, packet: any) => {
      let guild = bot.guilds.cache.get(guildId)
      if (guild) guild.shard.send(JSON.parse(packet))
    }
  )
)

async function run() {
  initEvents()

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)

  if (!process.env.BOT_TOKEN)
    throw Error(`Could not find BOT_TOKEN in your environment`)

  await bot.login(process.env.BOT_TOKEN)
}

void run()
