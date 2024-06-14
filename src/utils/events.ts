import { Interaction, TextChannel } from "discord.js"
import { bot, console } from "../index.js"
import { MoonlinkNode, MoonlinkPlayer, MoonlinkTrack } from "moonlink.js"

export function initEvents() {
  if (!bot.moon) {
    console.print("Moonlink init error")
    return
  }

  bot.on("ready", async () => {
    console.print(`Logged in as @${bot.user?.username}`)

    if (process.env.DEBUG)
      console.debug(`ready`, [`user: @${bot.user?.username} (${bot.user?.id})`])

    await bot.moon!.init(bot.user?.id)
    await bot.initApplicationCommands()
  })

  bot.on("raw", (data: any) => bot.moon!.packetUpdate(data))

  bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction)

    if (process.env.DEBUG)
      console.debug(`interaction`, [
        `guild: ${interaction.guildId}`,
        `user: @${interaction.user.username} (${interaction.user.id})`,
        interaction.isCommand()
          ? `cmd: /${interaction.commandName}`
          : undefined,
      ])
  })

  bot.moon.on("nodeCreate", async (node: MoonlinkNode) => {
    console.print(`Connected to Lavalink`)

    if (process.env.DEBUG)
      console.debug(`nodeCreate`, [`host: ${node.host}:${node.port}`])
  })

  bot.moon.on(
    "trackStart",
    async (player: MoonlinkPlayer, track: MoonlinkTrack) => {
      const channel = bot.channels.cache.get(player.textChannel) as TextChannel
      if (channel)
        channel.send(`\`${track.title}\` by \`${track.author}\` is playing`)

      if (process.env.DEBUG)
        console.debug(`trackStart`, [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title} by ${track.author}`,
        ])
    }
  )

  bot.moon.on(
    "trackEnd",
    async (player: MoonlinkPlayer, track: MoonlinkTrack) => {
      if (process.env.DEBUG)
        console.debug(`trackEnd`, [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title} by ${track.author}`,
        ])

      if (track.position + 1 >= player.queue.size && player.autoPlay) {
        const channel = bot.channels.cache.get(
          player.textChannel
        ) as TextChannel

        if (channel)
          channel.send(
            `:red_circle: Autoplay was enabled and last track wasn't a YouTube track. Autoplay currently works only with YouTube tracks, disconnecting...`
          )

        await player.destroy()
      }
    }
  )

  bot.moon.on(
    "trackError",
    async (player: MoonlinkPlayer, track: MoonlinkTrack) => {
      const channel = bot.channels.cache.get(player.textChannel) as TextChannel
      if (channel)
        channel.send(
          `Error has occurred while playing \`${track.title}\` by \`${track.author}\`, skipping...`
        )

      if (process.env.DEBUG)
        console.debug(`trackError`, [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title} by ${track.author}`,
        ])

      await player.skip()
    }
  )

  bot.moon.on("queueEnd", async (player: MoonlinkPlayer) => {
    await player.destroy()
    if (process.env.DEBUG)
      console.debug(`queueEnd`, [`guild: ${player.guildId}`])
  })

  bot.moon.on("playerDisconnect", async (player: MoonlinkPlayer) => {
    await player.destroy()
    if (process.env.DEBUG)
      console.debug(`playerDisconnect`, [`guild: ${player.guildId}`])
  })
}
