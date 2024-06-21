import { CommandInteraction, EmbedBuilder } from "discord.js"
import { Discord, Slash } from "discordx"
import { bot, color } from "../index.js"

@Discord()
export class Shuffle {
  @Slash({ description: "Shuffles queue", name: "shuffle" })
  async shuffle(interaction: CommandInteraction): Promise<void> {
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
      await interaction.reply({
        content: "Not connected to a voice channel",
        ephemeral: true,
      })

      return
    }

    if (player.queue.size < 5) {
      await interaction.reply({
        content: "Not enough songs - 5 (or more) tracks in queue required",
        ephemeral: true,
      })

      return
    }

    player.queue.shuffle()

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Shuffled queue",
            iconURL: process.env.QUEUE_PATH,
          })
          .setColor(color)
          .setDescription(
            "Successfully shuffled queue :twisted_rightwards_arrows:"
          )
          .setFooter({
            text: `@${interaction.user.username} used /${interaction.command!.name}`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
