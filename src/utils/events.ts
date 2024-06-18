import { EmbedBuilder, Interaction, TextChannel } from "discord.js"
import { bot, color, console } from "../index.js"
import { MoonlinkNode, MoonlinkPlayer, MoonlinkTrack } from "moonlink.js"
import { secondsToDuration } from "./duration.js"

export function initEvents() {
  bot.on("ready", async () => {
    console.print(`Logged in as: ${bot.user?.username}`)
    console.print(
      `Invite your bot by using URL below\n>> https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_APPLICATION_ID}&permissions=3262464&scope=applications.commands%20bot`
    )

    if (process.env.DEBUG)
      console.debug("ready", [`user: @${bot.user?.username} (${bot.user?.id})`])

    await bot.moon.init(bot.user?.id)
    await bot.initApplicationCommands()
  })

  bot.on("raw", (data: any) => bot.moon.packetUpdate(data))

  bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction)

    if (process.env.DEBUG)
      console.debug("interaction", [
        `guild: ${interaction.guildId}`,
        `user: @${interaction.user.username} (${interaction.user.id})`,
        interaction.isCommand()
          ? `cmd: /${interaction.commandName}`
          : undefined,
      ])
  })

  bot.on("voiceStateUpdate", async (oldState, newState) => {
    const player = bot.moon.players.get(newState.guild.id)

    if (
      oldState.channelId &&
      !newState.channelId &&
      player &&
      player.voiceChannel == oldState.channelId
    )
      if (oldState.channel?.members.size == 1) await player.destroy()

    if (process.env.DEBUG)
      console.debug("voiceStateUpdate", [
        `user: @${newState.member?.user.username} (${newState.member?.user.id})`,
        `oldState: ${oldState.channelId}`,
        `newState: ${newState.channelId}`,
      ])
  })

  bot.moon.on("nodeCreate", (node: MoonlinkNode) => {
    bot.moon.isConnected = true
    console.print("Connected to Lavalink")

    if (process.env.DEBUG)
      console.debug("nodeCreate", [`host: ${node.host}:${node.port}`])
  })

  bot.moon.on("nodeError", (node: MoonlinkNode, error: Error) => {
    if (process.env.DEBUG)
      console.debug("nodeError", [`error: ${error.message}`])
  })

  bot.moon.on(
    "trackStart",
    async (player: MoonlinkPlayer, track: MoonlinkTrack) => {
      const channel = bot.channels.cache.get(player.textChannel) as TextChannel
      if (channel)
        channel.send({
          embeds: [
            new EmbedBuilder()
              .addFields(
                {
                  name: "Author",
                  value: track.author,
                  inline: true,
                },
                {
                  name: "Duration",
                  value: secondsToDuration(Math.floor(track.duration / 1000)),
                  inline: true,
                },
                {
                  name: "Requested by",
                  value: track.requester
                    ? `<@${track.requester.id}>`
                    : "Autoplay",
                  inline: true,
                }
              )
              .setAuthor({
                name: "Now Playing",
                iconURL: process.env.PLAY_PATH,
              })
              .setColor(color)
              .setFooter({
                text: `${bot.user?.username} by @heapy (@heapybruh on GitHub)`,
                iconURL: process.env.LOGO_PATH,
              })
              .setTitle(track.title)
              .setTimestamp(Date.now())
              .setThumbnail(track.artworkUrl)
              .setURL(track.url),
          ],
        })

      if (process.env.DEBUG)
        console.debug("trackStart", [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title}`,
          `author: ${track.author}`,
          `duration: ${secondsToDuration(Math.floor(track.duration / 1000))}`,
        ])
    }
  )

  bot.moon.on(
    "trackEnd",
    async (player: MoonlinkPlayer, track: MoonlinkTrack) => {
      if (process.env.DEBUG)
        console.debug("trackEnd", [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title}`,
          `author: ${track.author}`,
          `duration: ${secondsToDuration(Math.floor(track.duration / 1000))}`,
        ])

      if (
        player.queue.size == 0 && // Queue is empty, last track (in queue) just ended
        player.autoPlay && // Autoplay is enabled
        !track.url.includes("www.youtube.com") && // all YouTube URL types get converted to "www.youtube.com"
        !track.url.indexOf("soundcloud.com") // all SoundCloud URL types get converted to "soundcloud.com"
      ) {
        const channel = bot.channels.cache.get(
          player.textChannel
        ) as TextChannel

        if (channel)
          channel.send(
            ":red_circle: Autoplay was enabled and last track wasn't a YouTube/SoundCloud track. Autoplay currently works only with YouTube & SoundCloud tracks, disconnecting..."
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
        console.debug("trackError", [
          `guild: ${player.guildId}`,
          track.requester
            ? `requester: @${track.requester.username} (${track.requester.id})`
            : undefined,
          `track: ${track.title}`,
          `author: ${track.author}`,
        ])

      await player.skip()
    }
  )

  bot.moon.on("queueEnd", async (player: MoonlinkPlayer) => {
    await player.destroy()
    if (process.env.DEBUG)
      console.debug("queueEnd", [`guild: ${player.guildId}`])
  })

  bot.moon.on("playerDisconnect", async (player: MoonlinkPlayer) => {
    await player.destroy()
    if (process.env.DEBUG)
      console.debug("playerDisconnect", [`guild: ${player.guildId}`])
  })
}
