import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashChoice, SlashOption } from "discordx"
import { bot, color } from "../index.js"
import { Terminal } from "../utils/terminal.js"

enum LoopMode {
  CURRENT_TRACK,
  QUEUE,
  DISABLED,
}

@Discord()
export class Loop {
  @Slash({
    description: "Manages loop",
    name: "loop",
  })
  async loop(
    @SlashChoice({ name: "Current Track", value: LoopMode.CURRENT_TRACK })
    @SlashChoice({ name: "Queue", value: LoopMode.QUEUE })
    @SlashChoice({ name: "Disabled", value: LoopMode.DISABLED })
    @SlashOption({
      name: "mode",
      description: "Select loop mode",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    mode: number,
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

      var player = bot.moon.players.get(interaction.guildId!)

      if (!player) {
        await interaction.reply({
          content: "Not connected to a voice channel",
          ephemeral: true,
        })

        return
      }

      var modeName

      switch (mode) {
        case LoopMode.CURRENT_TRACK:
          player.setLoop("track")
          modeName = "Current Track :notes:"
          break
        case LoopMode.QUEUE:
          player.setLoop("queue")
          modeName = "Queue :notepad_spiral:"
          break
        case LoopMode.DISABLED:
          player.setLoop("off")
          modeName = "Disabled :red_circle:"
          break
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Changed loop mode",
              iconURL: process.env.LOOP_PATH,
            })
            .setColor(color)
            .setDescription(
              `Successfully changed loop mode to: **${modeName}**`
            )
            .setFooter({
              text: `@${interaction.user.username} used /${interaction.command!.name}`,
              iconURL: process.env.LOGO_PATH,
            })
            .setTimestamp(Date.now()),
        ],
      })
    } catch (e) {
      Terminal.error(e)
    }
  }
}
