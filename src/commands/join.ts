import { CommandInteraction } from "discord.js"
import { Discord, Slash } from "discordx"
import { bot } from "../index.js"
import { Terminal } from "../utils/terminal.js"

@Discord()
export class Join {
  @Slash({
    description: "Joins voice channel",
    name: "join",
  })
  async join(interaction: CommandInteraction): Promise<void> {
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

      if (player) {
        await interaction.reply({
          content: "Already connected to a voice channel",
          ephemeral: true,
        })

        return
      }

      player = bot.moon.players.create({
        guildId: interaction.guildId!,
        voiceChannel: member.voice.channelId!,
        textChannel: interaction.channelId,
      })

      player.connect({
        setDeaf: true,
        setMute: false,
      })

      await interaction.reply("Joined voice channel")
    } catch (e) {
      Terminal.error(e)
    }
  }
}
