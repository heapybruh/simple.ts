import { EmbedBuilder, Interaction, TextChannel, User } from "discord.js"
import { bot, color } from "../index.js"
import { Player, Track, TTrackEndType } from "moonlink.js"
import { secondsToDuration } from "./duration.js"
import { Presence } from "./presence.js"
import { Terminal } from "./terminal.js"

export function initEvents(): void {
  bot.on("ready", async () => {
    await bot.initApplicationCommands()
    await Presence.update()

    Terminal.print(`Logged in as: ${bot.user?.username}`)
    Terminal.print(
      `Invite your bot by using URL below\n>> https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_APPLICATION_ID}&permissions=3262464&scope=applications.commands%20bot`
    )

    if (process.env.DEBUG_READY)
      Terminal.debug("ready", [
        `user: @${bot.user!.username} (${bot.user!.id})`,
      ])

    await bot.moon.init(bot.user!.id!)
  })

  bot.on("raw", (data: any) => bot.moon.packetUpdate(data))

  bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction)

    if (process.env.DEBUG_interactionCreate)
      Terminal.debug("interaction", [
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
      player.voiceChannelId == oldState.channelId
    )
      if (oldState.channel?.members.size == 1) await player.destroy()

    if (process.env.DEBUG_voiceStateUpdate)
      Terminal.debug("voiceStateUpdate", [
        `user: @${newState.member?.user.username} (${newState.member?.user.id})`,
        `oldState: ${oldState.channelId}`,
        `newState: ${newState.channelId}`,
      ])
  })

  bot.moon.on("nodeCreate", (node) => {
    Terminal.print("Connected to Lavalink")

    if (process.env.DEBUG_nodeCreate)
      Terminal.debug("nodeCreate", [`host: ${node.host}:${node.port}`])
  })

  bot.moon.on("nodeError", (node, error: Error) => {
    if (process.env.DEBUG_nodeError)
      Terminal.debug("nodeError", [`error: ${error.message}`])
  })

  bot.moon.on("trackStart", async (player: Player, track: Track) => {
    const channel = bot.channels.cache.get(player.textChannelId) as TextChannel
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
                value: track.requestedBy
                  ? `<@${(<User>track.requestedBy).id}>`
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
            .setThumbnail(track.artworkUrl ?? null)
            .setTitle(track.title)
            .setTimestamp(Date.now())
            .setURL(track.url ?? null),
        ],
      })

    if (process.env.DEBUG_trackStart)
      Terminal.debug("trackStart", [
        `guild: ${player.guildId}`,
        track.requestedBy
          ? `requester: @${(<User>track.requestedBy).username} (${(<User>track.requestedBy).id})`
          : undefined,
        `track: ${track.title}`,
        `author: ${track.author}`,
        `duration: ${secondsToDuration(Math.floor(track.duration / 1000))}`,
      ])
  })

  bot.moon.on(
    "trackEnd",
    async (
      player: Player,
      track: Track,
      type: TTrackEndType,
      payload?: any
    ) => {
      if (process.env.DEBUG_trackEnd)
        Terminal.debug("trackEnd", [
          `guild: ${player.guildId}`,
          track.requestedBy
            ? `requester: @${(<User>track.requestedBy).username} (${(<User>track.requestedBy).id})`
            : undefined,
          `track: ${track.title}`,
          `type: ${type}`,
          `payload: ${JSON.stringify(payload)}`,
          `author: ${track.author}`,
          `duration: ${secondsToDuration(Math.floor(track.duration / 1000))}`,
        ])

      if (!track.url) return

      if (
        player.queue.size == 0 && // Queue is empty, last track (in queue) just ended
        player.autoPlay && // Autoplay is enabled
        !track.url.includes("youtube.com") // all YouTube URL types get converted to "www.youtube.com"
      ) {
        const channel = bot.channels.cache.get(
          player.textChannelId
        ) as TextChannel

        if (channel)
          channel.send(
            ":red_circle: Autoplay was enabled and last track wasn't a YouTube track. Autoplay currently works only with YouTube tracks, disconnecting..."
          )

        await player.destroy()
      }
    }
  )

  bot.moon.on(
    "trackException",
    async (player: Player, track: Track, exception: any) => {
      const channel = bot.channels.cache.get(
        player.textChannelId
      ) as TextChannel
      if (channel)
        channel.send(
          `Error has occurred while playing \`${track.title}\` by \`${track.author}\`, skipping...`
        )

      if (process.env.DEBUG_trackError)
        Terminal.debug("trackException", [
          `exception: ${JSON.stringify(exception)}`,
          `guild: ${player.guildId}`,
          track.requestedBy
            ? `requester: @${(<User>track.requestedBy).username} (${(<User>track.requestedBy).id})`
            : undefined,
          `track: ${track.title}`,
          `author: ${track.author}`,
        ])

      if (player.queue.size == 0 && player.autoPlay)
        await player.seek(player.current.duration - 1)
      else await player.skip()
    }
  )

  bot.moon.on("playerDisconnected", async (player: Player) => {
    await player.destroy()

    if (process.env.DEBUG_playerDisconnect)
      Terminal.debug("playerDisconnected", [`guild: ${player.guildId}`])
  })
}
