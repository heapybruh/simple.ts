import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot, color } from "../index.js"
import { MoonlinkTrack } from "moonlink.js"

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

    const queue = player.queue.getQueue()

    if (queue.length == 0 && player.autoPlay) {
      await player.seek(player.current.duration - 1000)
      await interaction.reply("Skipped 1 track")
      return
    }

    if (!amount) amount = 1

    if (amount > queue.length) {
      await interaction.reply({
        content: "Amount is higher than queue size",
        ephemeral: true,
      })

      return
    }

    var skippedTracks = queue.splice(0, amount)
    var newCurrent = skippedTracks[skippedTracks.length - 1]
    player.manager.emit(
      "playerSkipped",
      player,
      <MoonlinkTrack>player.current,
      newCurrent
    )
    player.current = newCurrent
    player.queue.setQueue(queue)
    await player.play(newCurrent)

    await interaction.reply({
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
            text: `@${interaction.user.username} used /skip`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
