import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js"
import { Discord, SelectMenuComponent, Slash, SlashOption } from "discordx"
import { bot, color, genius } from "../index.js"
import { Song } from "genius-lyrics"
import {
  Pagination,
  PaginationItem,
  PaginationType,
} from "@discordx/pagination"
import { Terminal } from "../utils/terminal.js"

const annotation = new RegExp(String.raw`\[.+\]`)
const titleJunk = new RegExp(String.raw`\(.+\)`, "g")

function GeneratePages(song: Song, lyrics: string[]): PaginationItem[] {
  return lyrics.map((page, index) => {
    return {
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Page ${index + 1}/${lyrics.length}`,
            iconURL: process.env.LYRICS_PATH,
          })
          .setColor(color)
          .setDescription(page)
          .setFooter({
            text: "Lyrics will expire after 120 seconds of inactivity",
            iconURL: process.env.LOGO_PATH,
          })
          .setThumbnail(song.image)
          .setTimestamp(Date.now())
          .setTitle(`${song.title} by ${song.artist.name}`)
          .setURL(song.url),
      ],
    }
  })
}

@Discord()
export class Lyrics {
  @SelectMenuComponent({ id: "lyrics" })
  async handle(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply()

    const value = interaction.values?.[0]

    if (!value)
      return await interaction.editReply("invalid song id, select again")

    try {
      var song = await genius.songs.get(Number(value))
      var lyrics = await song.lyrics()
    } catch (error: any) {
      Terminal.error("Unable to get lyrics", [
        `guild: ${interaction.guildId}`,
        `user: @${interaction.user.username} (${interaction.user.id})`,
        `message: ${error.message}`,
      ])
      await interaction.editReply("Unable to get lyrics")
      return
    }

    const lyricsList = lyrics.split("\n")
    const lyricsPages: string[] = [""]
    var index = 0

    lyricsList.map((line) => {
      if (lyricsPages[index].length < 1024)
        // ~1024 characters per page
        lyricsPages[index] =
          lyricsPages[index] +
          "\n" +
          (line.match(annotation) ? `**${line}**` : line)
      else {
        lyricsPages.push(line)
        index++
      }
    })

    new Pagination(interaction, GeneratePages(song, lyricsPages), {
      type: PaginationType.Button,
      time: 120 * 1000,
      async onTimeout(page, message) {
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: "Lyrics have expired",
                iconURL: process.env.LYRICS_PATH,
              })
              .setColor(color)
              .setDescription("Use **/lyrics** again to get lyrics :sleeping:")
              .setFooter({
                text: `@${interaction.member?.user.username} used /lyrics`,
                iconURL: process.env.LOGO_PATH,
              })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }).send()
  }

  @Slash({
    description: "Returns lyrics of currently played song or specified track",
    name: "lyrics",
  })
  async lyrics(
    @SlashOption({
      description: "Query used for searching lyrics",
      name: "query",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    query: string,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true })

    var player = bot.moon.players.get(interaction.guildId!)

    if (query == undefined) {
      if (!player) {
        await interaction.editReply({
          content: "Not connected to a voice channel",
        })

        return
      }

      if (!player.playing || !player.current) {
        await interaction.editReply({
          content: "Not playing anything",
        })

        return
      }

      let current = player.current
      query = `${current.author} - ${current.title.replaceAll(titleJunk, "")}`
    }

    try {
      var songs = await genius.songs.search(query)
    } catch (error: any) {
      Terminal.error("Unable to get lyrics", [
        `guild: ${interaction.guildId}`,
        `user: @${interaction.user.username} (${interaction.user.id})`,
        `message: ${error.message}`,
      ])
      await interaction.editReply("Unable to get lyrics")
      return
    }

    if (songs.length == 0) {
      await interaction.editReply("Didn't find any lyrics with given query")
      return
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("lyrics")
      .setPlaceholder("Select a track")
      .addOptions(
        songs.map((song) => ({
          label: song.title,
          description: `by ${song.artist.name}`,
          value: song.id.toString(),
        }))
      )

    const actionRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        selectMenu
      )

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Select a track",
            iconURL: process.env.LYRICS_PATH,
          })
          .setColor(color)
          .setDescription("Choose track from the list to get lyrics :blush:")
          .setFooter({
            text: `@${interaction.member?.user.username} used /lyrics`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
      components: [actionRow],
    })
  }
}
