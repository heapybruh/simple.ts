import { CommandInteraction, EmbedBuilder, HexColorString } from "discord.js"
import { Discord, Slash } from "discordx"
import {
  Pagination,
  PaginationItem,
  PaginationType,
} from "@discordx/pagination"
import { bot, color } from "../index.js"
import { MoonlinkPlayer, MoonlinkQueue, MoonlinkTrack } from "moonlink.js"

function GeneratePages(
  player: MoonlinkPlayer,
  queue: MoonlinkQueue
): PaginationItem[] {
  const getQueue = queue.getQueue()
  const currentTrack = player.current as MoonlinkTrack
  const nowPlaying = currentTrack
    ? `Current Track: ${currentTrack.title} by ${currentTrack.author}`
    : null

  const pages = Array.from(Array(Math.ceil(queue.size / 20)).keys()).map(
    (pageIndex) => {
      function generateDescription() {
        var description = ``

        const slicedQueue = getQueue.slice(
          0 + pageIndex * 20,
          20 + pageIndex * 20
        )

        slicedQueue.map(
          (track, index) =>
            (description =
              description +
              `\n${(pageIndex == 0 ? 0 : 1) + index + pageIndex * 20}. [${track.title} by **${track.author}**](${track.url})`)
        )

        return description
      }

      return {
        title: `Page ${pageIndex + 1}/${Math.ceil(queue.size / 20)}`,
        description: `${generateDescription()}`,
      }
    }
  )

  if (!pages.length)
    return [
      {
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Page 1/1",
              iconURL: process.env.QUEUE_PATH,
            })
            .setColor(color)
            .setDescription(
              `${player.autoPlay ? "Autoplay is **enabled** :green_circle:" : "Autoplay is **disabled** :red_circle:"}\nLooks like queue is empty... :broom: :dash:`
            )
            .setFooter({
              text: "Queue will expire after 60 seconds of inactivity",
              iconURL: process.env.LOGO_PATH,
            })
            .setThumbnail(currentTrack ? currentTrack.artworkUrl : null)
            .setTimestamp(Date.now())
            .setTitle(nowPlaying)
            .setURL(currentTrack ? currentTrack.url : null),
        ],
      },
    ]

  return pages.map((page) => {
    return {
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: page.title,
            iconURL: process.env.QUEUE_PATH,
          })
          .setColor(color)
          .setDescription(page.description)
          .setFooter({
            text: "Queue will expire after 60 seconds of inactivity",
            iconURL: process.env.LOGO_PATH,
          })
          .setThumbnail(currentTrack ? currentTrack.artworkUrl : null)
          .setTimestamp(Date.now())
          .setTitle(nowPlaying)
          .setURL(currentTrack ? currentTrack.url : null),
      ],
    }
  })
}

@Discord()
export class Queue {
  @Slash({
    description: "Returns list of tracks that are currently in queue",
    name: "queue",
  })
  async queue(interaction: CommandInteraction): Promise<void> {
    if (!bot.moon.isConnected) {
      await interaction.reply({
        content: "Not connected to Lavalink server",
        ephemeral: true,
      })

      return
    }

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.reply({
        content: "Not connected to a voice channel",
        ephemeral: true,
      })

      return
    }

    new Pagination(interaction, GeneratePages(player, player.queue), {
      type: PaginationType.Button,
      time: 60 * 1000,
      async onTimeout(page, message) {
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: "Queue has expired",
                iconURL: process.env.QUEUE_PATH,
              })
              .setColor(color)
              .setDescription(
                "Use **/queue** again to get the queue :sleeping:"
              )
              .setFooter({
                text: `@${interaction.member?.user.username} used /${interaction.command!.name}`,
                iconURL: process.env.LOGO_PATH,
              })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }).send()
  }
}
