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
    } catch (error) {
      await interaction.editReply("Unable to get lyrics")
      return
    }

    const lyricsList = (await song.lyrics()).split("\n")
    const lyrics: string[] = [""]
    var index = 0

    lyricsList.map((line) => {
      if (lyrics[index].length < 1024)
        // ~1024 characters per page
        lyrics[index] =
          lyrics[index] + "\n" + (line.match(annotation) ? `**${line}**` : line)
      else {
        lyrics.push(line)
        index++
      }
    })

    new Pagination(interaction, GeneratePages(song, lyrics), {
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
    if (!bot.moon.isConnected) {
      await interaction.reply({
        content: "Not connected to Lavalink server",
        ephemeral: true,
      })

      return
    }

    var player = bot.moon.players.get(interaction.guildId!)

    if (query == undefined) {
      if (!player) {
        await interaction.reply({
          content: "Not connected to a voice channel",
          ephemeral: true,
        })

        return
      }

      if (!player.playing || !player.current) {
        await interaction.reply({
          content: "Not playing anything",
          ephemeral: true,
        })

        return
      }

      let current = player.current
      query = `${current.author} - ${current.title.replaceAll(titleJunk, "")}`
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      var songs = await genius.songs.search(query)
    } catch (error) {
      await interaction.editReply("Unable to get lyrics")
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