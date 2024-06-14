import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Skip {
  @Slash({
    description: "Skips song(s)",
    name: "skip",
  })
  async skip(
    @SlashOption({
      description: "Amount of songs you want to skip",
      name: "amount",
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    interaction: CommandInteraction
  ): Promise<void> {
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

    if (!amount) amount = 1

    if (amount > player.queue.size) {
      await interaction.reply({
        content: "Amount is higher than queue size",
        ephemeral: true,
      })

      return
    }

    await player.skip(amount)
    await interaction.reply(
      `Skipped ${amount} ${amount > 1 ? `songs` : "song"}`
    )
  }
}
