import { CommandInteraction, EmbedBuilder } from "discord.js"
import { Discord, Slash } from "discordx"
import {
  Pagination,
  PaginationItem,
  PaginationType,
} from "@discordx/pagination"
import { bot } from "../index.js"
import { MoonlinkPlayer, MoonlinkQueue, MoonlinkTrack } from "moonlink.js"

function GeneratePages(
  player: MoonlinkPlayer,
  queue: MoonlinkQueue
): PaginationItem[] {
  const getQueue = queue.getQueue()
  const currentTrack = player.current as MoonlinkTrack
  const nowPlaying = `Current track: ${currentTrack.title} by ${currentTrack.author}`
  const footer = bot.user?.avatarURL()

  const pages = Array.from(Array(Math.ceil(queue.size / 20)).keys()).map(
    (pageIndex) => {
      function generateDescription() {
        var description = ``

        const slicedQueue = getQueue.slice(
          0 + pageIndex * 10,
          10 + pageIndex * 10
        )

        slicedQueue.map(
          (track, index) =>
            (description =
              description +
              `\n${index + pageIndex * 10}. [${track.title}](${track.url}) by **${track.author}**`)
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
            .setTitle(nowPlaying)
            .setURL(currentTrack.url)
            .setThumbnail(currentTrack.artworkUrl)
            .setDescription("Looks like queue is empty... :broom: :dash:")
            .setColor([48, 120, 199])
            .setFooter({
              text: "Buttons will be removed after 60 seconds of inactivity",
              iconURL: process.env.LOGO_PATH,
            }),
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
          .setTitle(nowPlaying)
          .setURL(currentTrack.url)
          .setThumbnail(currentTrack.artworkUrl)
          .setDescription(page.description)
          .setColor([48, 120, 199])
          .setFooter({
            text: "Buttons will be removed after 60 seconds of inactivity",
            iconURL: process.env.LOGO_PATH,
          }),
      ],
    }
  })
}

@Discord()
export class Queue {
  @Slash({
    description: "Returns list of songs that are currently in queue",
    name: "queue",
  })
  async queue(interaction: CommandInteraction): Promise<void> {
    if (!bot.moon) {
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
    }).send()
  }
}