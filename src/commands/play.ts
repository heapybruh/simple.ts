import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Play {
  @Slash({
    description:
      "Plays music from multiple platforms such as YouTube, SoundCloud or Spotify",
    name: "play",
  })
  async play(
    @SlashOption({
      description: "Query that will be used for searching song(s)",
      name: "query",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    query: string,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!bot.moon) {
      await interaction.reply({
        content: "Not connected to Lavalink server",
        ephemeral: true,
      })

      return
    }

    var member = interaction.guild?.members.cache.get(
      interaction.member?.user.id!
    )

    if (!member?.voice) {
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
        content: "Error has occurred while getting song(s)",
      })

      return
    } else if (results.loadType == "empty") {
      await interaction.reply({
        content: "Couldn't find song(s)",
      })

      return
    }

    if (results.loadType == "playlist") {
      await interaction.reply({
        content: `Added playlist \`${results.playlistInfo!.name}\` to queue`,
      })

      for (const track of results.tracks) player.queue.add(track)
    } else {
      player.queue.add(results.tracks[0])

      await interaction.reply({
        content: `Added song \`${results.tracks[0].title}\` by \`${results.tracks[0].author}\` to queue`,
      })
    }

    if (!player.playing) await player.play()
  }
}
