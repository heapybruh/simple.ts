import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  User,
  type CommandInteraction,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot, color } from "../index.js"
import { secondsToDuration } from "../utils/duration.js"
import { Terminal } from "../utils/terminal.js"

@Discord()
export class Play {
  @Slash({
    description:
      "Adds requested track(s) (YouTube, SoundCloud or Spotify) to queue",
    name: "play",
  })
  async play(
    @SlashOption({
      description: "Query that will be used for searching track(s)",
      name: "query",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    query: string,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply()

    var member = interaction.guild?.members.cache.get(
      interaction.member?.user.id!
    )

    if (!member?.voice || member?.voice.channelId == null) {
      await interaction.editReply({
        content: "You are not in a voice channel",
      })

      return
    }

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      player = bot.moon.players.create({
        guildId: interaction.guildId!,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        autoLeave: true,
      })

      player.connect({
        setDeaf: true,
        setMute: false,
      })
    }

    var results = await bot.moon.search({
      query: query,
      requester: interaction.user,
    })

    if (results.loadType == "error") {
      await interaction.editReply({
        content: "Error has occurred while getting track(s)",
      })

      return
    } else if (results.loadType == "empty") {
      await interaction.editReply({
        content: "Couldn't find track(s)",
      })

      return
    }

    if (results.loadType == "playlist") {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .addFields({
              name: "Requested by",
              value: results.tracks[0].requestedBy
                ? `<@${(<User>results.tracks[0].requestedBy).id}>`
                : "Not Found",
              inline: true,
            })
            .setAuthor({
              name: "Added playlist to queue",
              iconURL: process.env.QUEUE_PATH,
            })
            .setColor(color)
            .setFooter({
              text: `@${member.user.username} used /${interaction.command!.name}`,
              iconURL: process.env.LOGO_PATH,
            })
            .setTimestamp(Date.now())
            .setTitle(results.playlistInfo!.name)
            .setURL(query),
        ],
      })

      for (const track of results.tracks) player.queue.add(track)
    } else {
      const duration = secondsToDuration(
        Math.floor(results.tracks[0].duration / 1000)
      )

      player.queue.add(results.tracks[0])
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .addFields(
              {
                name: "Author",
                value: results.tracks[0].author,
                inline: true,
              },
              {
                name: "Duration",
                value: duration,
                inline: true,
              },
              {
                name: "Requested by",
                value: results.tracks[0].requestedBy
                  ? `<@${(<User>results.tracks[0].requestedBy).id}>`
                  : "Not Found",
                inline: true,
              }
            )
            .setAuthor({
              name: "Added track to queue",
              iconURL: process.env.QUEUE_PATH,
            })
            .setColor(color)
            .setFooter({
              text: `@${member.user.username} used /${interaction.command!.name}`,
              iconURL: process.env.LOGO_PATH,
            })
            .setImage(results.tracks[0].artworkUrl ?? null)
            .setTimestamp(Date.now())
            .setTitle(results.tracks[0].title)
            .setURL(results.tracks[0].url ?? null),
        ],
      })
    }

    if (!player.playing) await player.play()
  }
}
