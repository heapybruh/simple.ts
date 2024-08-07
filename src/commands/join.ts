import { CommandInteraction } from "discord.js"
import { Discord, Slash } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Join {
  @Slash({
    description: "Joins voice channel",
    name: "join",
  })
  async join(interaction: CommandInteraction): Promise<void> {
    if (bot.moon.nodes.cache.get("socket")) {
      await interaction.reply({
        content: "Not connected to NodeLink",
        ephemeral: true,
      })

      return
    }

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

    if (player) {
      await interaction.editReply({
        content: "Already connected to a voice channel",
      })

      return
    }

    player = bot.moon.players.create({
      guildId: interaction.guildId!,
      voiceChannelId: member.voice.channelId,
      textChannelId: interaction.channelId,
    })

    player.connect({
      setDeaf: true,
      setMute: false,
    })

    await interaction.editReply("Joined voice channel")
  }
}
