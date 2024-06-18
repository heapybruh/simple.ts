import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Skip {
  @Slash({
    description: "Skips track(s)",
    name: "skip",
  })
  async skip(
    @SlashOption({
      description: "Amount of tracks you want to skip",
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

    const player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.reply({
        content: "Not connected to a voice channel",
        ephemeral: true,
      })

      return
    }

    const queue = player.queue

    if (queue.size == 0 && player.autoPlay) {
      await player.seek(player.current.duration - 1000)
      await interaction.reply("Skipped 1 track")
      return
    }

    if (!amount) amount = 1

    if (amount > queue.size) {
      await interaction.reply({
        content: "Amount is higher than queue size",
        ephemeral: true,
      })

      return
    }

    await player.skip(amount)
    await interaction.reply(
      `Skipped ${amount} ${amount > 1 ? "tracks" : "track"}`
    )
  }
}
