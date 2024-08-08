import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot, color } from "../index.js"
import { Track } from "moonlink.js"

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

    var skippedTracks = player.queue.tracks.splice(0, amount)
    var newCurrent = skippedTracks[skippedTracks.length - 1]
    player.manager.emit(
      "playerTriggeredSkip",
      player,
      <Track>player.current,
      newCurrent,
      0
    )
    player.current = newCurrent
    await player.play()

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Skipped track(s)",
            iconURL: process.env.QUEUE_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully skipped ${amount} ${amount > 1 ? "tracks" : "track"} :notes:`
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
