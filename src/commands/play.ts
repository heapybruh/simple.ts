import {
  ApplicationCommandOptionType,
  EmbedBuilder,
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
    try {
      if (!bot.moon.isConnected) {
        await interaction.reply({
          content: "Not connected to Lavalink server",
          ephemeral: true,
        })

        return
      }

      var member = interaction.guild?.members.cache.get(
        interaction.member?.user.id!
      )

      if (!member?.voice || member?.voice.channelId == null) {
        await interaction.reply({
          content: "You are not in a voice channel",
          ephemeral: true,
        })

        return
      }

      var player = bot.moon.players.get(interaction.guildId!)

      if (!player) {
        player = bot.moon.players.create({
          guildId: interaction.guildId!,
          voiceChannel: member.voice.channelId!,
          textChannel: interaction.channelId,
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
        await interaction.reply({
          content: "Error has occurred while getting track(s)",
        })

        return
      } else if (results.loadType == "empty") {
        await interaction.reply({
          content: "Couldn't find track(s)",
        })

        return
      }

      const duration = secondsToDuration(
        Math.floor(
          results.loadType == "playlist"
            ? results.playlistInfo!.duration / 1000
            : results.tracks[0].duration / 1000
        )
      )

      if (results.loadType == "playlist") {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .addFields(
                {
                  name: "Duration",
                  value: duration,
                  inline: true,
                },
                {
                  name: "Requested by",
                  value: results.tracks[0].requester
                    ? `<@${results.tracks[0].requester.id}>`
                    : "Not Found",
                  inline: true,
                }
              )
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
        player.queue.add(results.tracks[0])
        await interaction.reply({
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
                  value: results.tracks[0].requester
                    ? `<@${results.tracks[0].requester.id}>`
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
              .setImage(results.tracks[0].artworkUrl)
              .setTimestamp(Date.now())
              .setTitle(results.tracks[0].title)
              .setURL(results.tracks[0].url),
          ],
        })
      }

      if (!player.playing) await player.play()
    } catch (e) {
      Terminal.error(e)
    }
  }
}
