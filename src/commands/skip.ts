import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "npm:discord.js"
import { Discord, Slash, SlashOption } from "npm:discordx"
import { bot, color } from "../index.ts"
import process from "node:process"

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
    if (bot.moon.nodes.cache.get("socket")) {
      await interaction.reply({
        content: "Not connected to NodeLink",
        ephemeral: true,
      })

      return
    }

    await interaction.deferReply()

    const player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.editReply({
        content: "Not connected to a voice channel",
      })

      return
    }

    if (player.queue.size == 0 && player.autoPlay) {
      await player.seek(player.current.duration - 1)
      await interaction.editReply("Skipped 1 track")
      return
    }

    if (!amount) amount = 1

    if (amount > player.queue.size) {
      await interaction.editReply({
        content: "Amount is higher than queue size",
      })

      return
    }

    await player.skip(amount - 1)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Skipped track(s)",
            iconURL: process.env.QUEUE_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully skipped ${amount} ${
              amount > 1 ? "tracks" : "track"
            } :notes:`
          )
          .setFooter({
            text: `@${interaction.user.username} used /${
              interaction.command!.name
            }`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
