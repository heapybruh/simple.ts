import dotenv from "dotenv"
import { importx, dirname } from "@discordx/importer"
import { initEvents } from "./utils/events.ts"
import { DiscordClient } from "./utils/clients.ts"
import { HexColorString } from "discord.js"
import { Client as Genius } from "genius-lyrics"
import { CronJob } from "cron"
import { Presence } from "./utils/presence.ts"
import { Manager } from "moonlink.js"
import process from "node:process"

dotenv.config()

export const bot = new DiscordClient(
  {
    intents: 131071,
    silent: true,
  },
  new Manager({
    nodes: [
      {
        host: process.env.LAVA_HOST ? process.env.LAVA_HOST : `127.0.0.1`,
        port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : 2333,
        secure: process.env.LAVA_SECURE
          ? process.env.LAVA_SECURE == "ENABLED"
          : false,
        password: process.env.LAVA_PASS
          ? process.env.LAVA_PASS
          : `youshallnotpass`,
      },
    ],
    options: {},
    sendPayload: (guildId: any, packet: any) => {
      const guild = bot.guilds.cache.get(guildId)
      if (guild) guild.shard.send(JSON.parse(packet))
    },
  })
)

export const color: HexColorString = `#${process.env.EMBED_COLOR}`

export const richPresence = CronJob.from({
  cronTime: "*/5 * * * *", // Every 5 minutes - https://crontab.guru/
  onTick: async () => {
    if (!bot.user) return
    await Presence.update()
  },
  start: true,
  timeZone: "UTC",
})

export const genius: Genius = new Genius(
  process.env.GENIUS_API_KEY ? process.env.GENIUS_API_KEY : undefined
)

async function run() {
  initEvents()

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)

  if (!process.env.BOT_TOKEN)
    throw Error(`Could not find BOT_TOKEN in your environment`)

  await bot.login(process.env.BOT_TOKEN)
}

void run()
