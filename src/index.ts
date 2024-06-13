import { IntentsBitField, Interaction, TextChannel } from "discord.js"
import { Client, ClientOptions } from "discordx"
import { MoonlinkManager } from "moonlink.js"
import * as dotenv from "dotenv"
import { importx, dirname } from "@discordx/importer"

dotenv.config()

class SimpleClient extends Client {
  moon: MoonlinkManager | undefined

  constructor(options: ClientOptions) {
    super(options)
  }
}

export const bot = new SimpleClient({
  intents: 131071,
  silent: true,
})

bot.moon = new MoonlinkManager(
  [
    {
      host: process.env.LAVA_HOST ? process.env.LAVA_HOST : "127.0.0.1",
      port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : 2333,
      secure: false,
      password: process.env.LAVA_PASS
        ? process.env.LAVA_PASS
        : "youshallnotpass",
    },
  ],
  {},
  (guildId: any, packet: any) => {
    let guild = bot.guilds.cache.get(guildId)
    if (guild) guild.shard.send(JSON.parse(packet))
  }
)

bot.on("ready", async () => {
  await bot.moon!.init(bot.user?.id)
  await bot.initApplicationCommands()
})

bot.on("raw", (data) => bot.moon!.packetUpdate(data))

bot.on("interactionCreate", (interaction: Interaction) =>
  bot.executeInteraction(interaction)
)

bot.moon.on("nodeCreate", (node) => {
  console.log(`Connected to Lavalink: ${node.host}`)
})

bot.moon.on("trackStart", async (player, track) => {
  const channel = bot.channels.cache.get(player.textChannel) as TextChannel
  if (channel) channel.send(`${track.title} is playing`)
})

bot.moon.on("trackEnd", async (player) => {})

bot.moon.on("playerDisconnect", async (player) => await player.destroy())

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)

  if (!process.env.BOT_TOKEN)
    throw Error("Could not find BOT_TOKEN in your environment")

  await bot.login(process.env.BOT_TOKEN)
}

void run()
