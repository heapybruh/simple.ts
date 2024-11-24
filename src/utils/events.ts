import { EmbedBuilder, Interaction, TextChannel, User } from "discord.js"
import { bot, color } from "../index.ts"
import { Player, Track, TTrackEndType } from "moonlink.js"
import { secondsToDuration } from "./duration.ts"
import { Presence } from "./presence.ts"
import { Terminal } from "./terminal.ts"
import process from "node:process"

export function initEvents(): void {
  bot.on("ready", async () => {
    await bot.initApplicationCommands()
    await Presence.update()

    Terminal.print(`Logged in as: ${bot.user?.username}`)
    Terminal.print(
      `Invite your bot by using URL below\n>> https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_APPLICATION_ID}&permissions=3262464&scope=applications.commands%20bot`
    )

    await bot.moon.init(bot.user!.id!)
  })

  bot.on("raw", (data: any) => bot.moon.packetUpdate(data))

  bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction)
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
  })

  bot.moon.on("nodeCreate", (node) => {
    Terminal.print("Connected to Lavalink")
  })

  bot.moon.on("trackStart", async (player: Player, track: Track) => {
    const channel = bot.channels.cache.get(player.textChannelId) as TextChannel
    if (channel)
      await channel.send({
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
              iconURL: process.env.PLAY_ICON,
            })
            .setColor(color)
            .setFooter({
              text: "simple.ts maintained by heapy",
              iconURL: process.env.LOGO,
            })
            .setThumbnail(track.artworkUrl ?? null)
            .setTitle(track.title)
            .setTimestamp(Date.now())
            .setURL(track.url ?? null),
        ],
      })
  })

  bot.moon.on(
    "trackEnd",
    async (
      player: Player,
      track: Track,
      type: TTrackEndType,
      payload?: any
    ) => {
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

      if (player.queue.size == 0 && player.autoPlay)
        await player.seek(player.current.duration - 1)
      else await player.skip()
    }
  )

  bot.moon.on("playerDisconnected", async (player: Player) => {
    await player.destroy()
  })
}
